#[macro_use]
extern crate napi;
#[macro_use]
extern crate napi_derive;

use std::path::PathBuf;
use std::str;
use std::str::FromStr;
use std::sync::Arc;

use napi::{CallContext, Env, Error, JsObject, JsString, Module, Result, Status, Task};
use once_cell::sync::OnceCell;
use swc::{config::Options, Compiler, TransformOutput};
use swc_common::{self, errors::Handler, FileName, FilePathMapping, SourceMap};

mod jest;

#[cfg(all(unix, not(target_env = "musl")))]
#[global_allocator]
static ALLOC: jemallocator::Jemalloc = jemallocator::Jemalloc;

#[cfg(windows)]
#[global_allocator]
static ALLOC: mimalloc::MiMalloc = mimalloc::MiMalloc;

static COMPILER: OnceCell<Compiler> = OnceCell::new();

#[inline]
pub(crate) fn get_compiler() -> &'static Compiler {
  COMPILER.get_or_init(|| {
    let cm = Arc::new(SourceMap::new(FilePathMapping::empty()));
    let handler = Handler::with_tty_emitter(
      swc_common::errors::ColorConfig::Always,
      true,
      false,
      Some(cm.clone()),
    );
    Compiler::new(cm.clone(), Arc::new(handler))
  })
}

pub struct TransformTask {
  source: String,
  filename: String,
  options: Options,
}

impl TransformTask {
  pub fn new(source: String, filename: String, options: Options) -> Self {
    Self {
      source,
      filename,
      options,
    }
  }

  #[inline]
  pub fn perform(
    source: String,
    filename: &str,
    register_options: &Options,
  ) -> Result<TransformOutput> {
    let c = get_compiler();
    let fm = c.cm.new_source_file(
      FileName::Real(
        PathBuf::from_str(filename)
          .map_err(|e| Error::new(Status::InvalidArg, format!("Invalid path {}", e)))?,
      ),
      source,
    );

    c.process_js_file(fm, &register_options).map_err(|e| {
      Error::new(
        Status::GenericFailure,
        format!("Process js file: {} failed {}", filename, e),
      )
    })
  }
}

impl Task for TransformTask {
  type Output = TransformOutput;
  type JsValue = JsObject;

  fn compute(&mut self) -> Result<Self::Output> {
    TransformTask::perform(self.source.clone(), self.filename.as_str(), &self.options)
  }

  fn resolve(&self, env: &mut Env, output: Self::Output) -> Result<Self::JsValue> {
    let mut result = env.create_object()?;
    result.set_named_property("code", env.create_string_from_std(output.code)?)?;
    if let Some(m) = output.map {
      result.set_named_property("map", env.create_string_from_std(m)?)?;
    }
    Ok(result)
  }
}

register_module!(swc, init);

fn init(module: &mut Module) -> Result<()> {
  module.create_named_method("transformSync", transform_sync)?;

  module.create_named_method("transform", transform)?;

  module.create_named_method("transformJest", jest_transform)?;
  Ok(())
}

#[js_function(3)]
fn transform_sync(ctx: CallContext) -> Result<JsObject> {
  let filename = ctx.get::<JsString>(1)?;
  let options_string = ctx.get::<JsString>(2)?;
  let options: Options = serde_json::from_str(options_string.as_str()?)
    .map_err(|e| Error::new(Status::InvalidArg, format!("{}", e)))?;
  let output = TransformTask::perform(
    ctx.get::<JsString>(0)?.as_str()?.to_owned(),
    filename.as_str()?,
    &options,
  )?;
  let mut result = ctx.env.create_object()?;
  result.set_named_property("code", ctx.env.create_string_from_std(output.code)?)?;
  result.set_named_property(
    "map",
    match output.map {
      None => ctx.env.get_null()?.into_unknown()?,
      Some(sm) => ctx.env.create_string_from_std(sm)?.into_unknown()?,
    },
  )?;
  Ok(result)
}

#[js_function(3)]
fn transform(ctx: CallContext) -> Result<JsObject> {
  let filename = ctx.get::<JsString>(1)?;
  let options_string = ctx.get::<JsString>(2)?;
  let options: Options = serde_json::from_str(options_string.as_str()?)
    .map_err(|e| Error::new(Status::InvalidArg, format!("{}", e)))?;
  let task = TransformTask::new(
    ctx.get::<JsString>(0)?.as_str()?.to_owned(),
    filename.as_str()?.to_owned(),
    options,
  );
  ctx.env.spawn(task)
}

#[js_function(3)]
fn jest_transform(ctx: CallContext) -> Result<JsObject> {
  let filename = ctx.get::<JsString>(1)?;
  let options_string = ctx.get::<JsString>(2)?;
  let options: Options = serde_json::from_str(options_string.as_str()?)
    .map_err(|e| Error::new(Status::InvalidArg, format!("{}", e)))?;
  let output = jest::jest_transform(
    ctx.get::<JsString>(0)?.as_str()?.to_owned(),
    filename.as_str()?,
    &options,
  )?;
  let mut result = ctx.env.create_object()?;
  result.set_named_property("code", ctx.env.create_string_from_std(output.code)?)?;
  result.set_named_property(
    "map",
    match output.map {
      None => ctx.env.get_null()?.into_unknown()?,
      Some(sm) => ctx.env.create_string_from_std(sm)?.into_unknown()?,
    },
  )?;
  Ok(result)
}
