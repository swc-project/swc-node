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
use serde::{Deserialize, Serialize};
use swc::{
  common::{self, errors::Handler, FileName, FilePathMapping, SourceMap},
  config::{
    Config, JscConfig, JscTarget, ModuleConfig, Options, SourceMapsConfig, TransformConfig,
  },
  ecmascript::parser::{Syntax, TsConfig},
  Compiler, TransformOutput,
};

#[cfg(all(unix, not(target_env = "musl")))]
#[global_allocator]
static ALLOC: jemallocator::Jemalloc = jemallocator::Jemalloc;

static COMPILER: OnceCell<Compiler> = OnceCell::new();

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterOptions {
  target: JscTarget,
  module: ModuleConfig,
  sourcemap: SourceMapsConfig,
  tsx: bool,
  legacy_decorator: bool,
  dynamic_import: bool,
  no_early_errors: bool,
  filename: String,
}

pub struct TransformTask {
  source: JsBuffer,
  filename: String,
  options: RegisterOptions,
}

impl TransformTask {
  pub fn new(source: JsBuffer, filename: String, options: RegisterOptions) -> Self {
    Self {
      source,
      filename,
      options,
    }
  }

  #[inline]
  pub fn perform(
    source: JsBuffer,
    filename: &str,
    register_options: &RegisterOptions,
  ) -> Result<TransformOutput> {
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
    let mut options = Options::default();
    let mut config = Config::default();
    let mut transform_config = TransformConfig::default();
    options.is_module = true;
    options.source_maps = Some(SourceMapsConfig::Bool(true));
    transform_config.legacy_decorator = register_options.legacy_decorator;
    config.jsc = JscConfig::default();
    config.jsc.target = register_options.target;
    config.jsc.transform = Some(transform_config);
    config.jsc.syntax = Some(Syntax::Typescript(TsConfig {
      tsx: register_options.tsx,
      decorators: register_options.legacy_decorator,
      dynamic_import: register_options.dynamic_import,
      dts: false,
      no_early_errors: register_options.no_early_errors,
    }));
    config.module = Some(register_options.module.clone());
    options.config = Some(config);
    options.disable_hygiene = false;
    options.filename = register_options.filename.clone();

    c.process_js_file(fm, &options)
      .map_err(|e| Error::new(Status::GenericFailure, format!("Process js failed {}", e)))
  }
}

impl Task for TransformTask {
  type Output = TransformOutput;
  type JsValue = JsObject;

  fn compute(&mut self) -> Result<Self::Output> {
    TransformTask::perform(self.source, self.filename.as_str(), &self.options)
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
  Ok(())
}

#[js_function(3)]
fn transform_sync(ctx: CallContext) -> Result<JsObject> {
  let filename = ctx.get::<JsString>(1)?;
  let options_str = ctx.get::<JsString>(2)?;
  let options: RegisterOptions = serde_json::from_str(options_str.as_str()?).map_err(|e| {
    Error::new(
      Status::InvalidArg,
      format!("Options is not a valid json {}", e),
    )
  })?;
  let output = TransformTask::perform(ctx.get::<JsBuffer>(0)?, filename.as_str()?, &options)?;
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

#[js_function(3)]
fn transform(ctx: CallContext) -> Result<JsObject> {
  let filename = ctx.get::<JsString>(1)?;
  let options_str = ctx.get::<JsString>(2)?;
  let options: RegisterOptions = serde_json::from_str(options_str.as_str()?).map_err(|e| {
    Error::new(
      Status::InvalidArg,
      format!("Options is not a valid json {}", e),
    )
  })?;
  let task = TransformTask::new(
    ctx.get::<JsBuffer>(0)?,
    filename.as_str()?.to_owned(),
    options,
  );
  ctx.env.spawn(task)
}
