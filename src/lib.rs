#[macro_use]
extern crate napi;
#[macro_use]
extern crate napi_derive;

use std::path::PathBuf;
use std::str;
use std::str::FromStr;
use std::sync::Arc;

use napi::{CallContext, Env, Error, JsBuffer, JsObject, JsString, Module, Result, Status, Task};
use once_cell::sync::OnceCell;

use swc::{
  common::{self, errors::Handler, FileName, FilePathMapping, SourceMap},
  config::Options,
  Compiler, TransformOutput,
};

#[cfg(all(unix, not(target_env = "musl")))]
#[global_allocator]
static ALLOC: jemallocator::Jemalloc = jemallocator::Jemalloc;

static COMPILER: OnceCell<Compiler> = OnceCell::new();

pub struct TransformTask {
  source: JsBuffer,
  filename: String,
}

impl TransformTask {
  pub fn new(source: JsBuffer, filename: String) -> Self {
    Self { source, filename }
  }

  #[inline]
  pub fn perform(source: JsBuffer, filename: &str) -> Result<TransformOutput> {
    let c = COMPILER.get_or_init(|| {
      let cm = Arc::new(SourceMap::new(FilePathMapping::empty()));
      let handler = Handler::with_tty_emitter(
        common::errors::ColorConfig::Always,
        true,
        false,
        Some(cm.clone()),
      );
      Compiler::new(cm.clone(), Arc::new(handler))
    });
    let fm = c.cm.new_source_file(
      FileName::Real(
        PathBuf::from_str(filename)
          .map_err(|e| Error::new(Status::InvalidArg, format!("Invalid path {}", e)))?,
      ),
      str::from_utf8(&source)
        .map_err(|e| Error {
          status: Status::StringExpected,
          reason: format!("Invalid source code, {}", e),
        })?
        .to_owned(),
    );
    let program = c.run(|| {
      c.process_js_file(fm, &Options::default())
        .map_err(|e| Error {
          status: Status::GenericFailure,
          reason: format!("Parse js failed {}", e),
        })
    })?;
    Ok(program)
  }
}

impl Task for TransformTask {
  type Output = TransformOutput;
  type JsValue = JsObject;

  fn compute(&mut self) -> Result<Self::Output> {
    TransformTask::perform(self.source, self.filename.as_str())
  }

  fn resolve(&self, env: &mut Env, output: Self::Output) -> Result<Self::JsValue> {
    let mut result = env.create_object()?;
    result.set_named_property("code", env.create_string_from_std(output.code)?)?;
    result.set_named_property(
      "map",
      env.create_string_from_std(output.map.unwrap_or("".to_owned()))?,
    )?;
    Ok(result)
  }
}

register_module!(swc, init);

fn init(module: &mut Module) -> Result<()> {
  module.create_named_method("transformSync", transform_sync)?;

  module.create_named_method("transform", transform)?;
  Ok(())
}

#[js_function(2)]
fn transform_sync(ctx: CallContext) -> Result<JsObject> {
  let filename = ctx.get::<JsString>(1)?;
  let output = TransformTask::perform(ctx.get::<JsBuffer>(0)?, filename.as_str()?)?;
  let mut result = ctx.env.create_object()?;
  result.set_named_property("code", ctx.env.create_string_from_std(output.code)?)?;
  result.set_named_property(
    "map",
    ctx
      .env
      .create_string_from_std(output.map.unwrap_or("".to_owned()))?,
  )?;
  Ok(result)
}

#[js_function(2)]
fn transform(ctx: CallContext) -> Result<JsObject> {
  let filename = ctx.get::<JsString>(1)?;
  let task = TransformTask::new(ctx.get::<JsBuffer>(0)?, filename.as_str()?.to_owned());
  ctx.env.spawn(task)
}
