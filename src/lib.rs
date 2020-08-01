#[macro_use]
extern crate napi;
#[macro_use]
extern crate napi_derive;

use std::path::PathBuf;
use std::str;
use std::str::FromStr;
use std::sync::Arc;

use napi::{
  CallContext, Env, Error, JsBoolean, JsBuffer, JsObject, JsString, Module, Result, Status, Task,
};
use once_cell::sync::OnceCell;
use swc::{
  config::{
    Config, JscConfig, JscTarget, ModuleConfig, Options, SourceMapsConfig, TransformConfig,
  },
  Compiler, TransformOutput,
};
use swc_common::{self, errors::Handler, FileName, FilePathMapping, SourceMap};
use swc_ecmascript::parser::{Syntax, TsConfig};
use swc_ecmascript::transforms::modules::amd::Config as AmdConfig;
use swc_ecmascript::transforms::modules::common_js::Config as CommonJsConfig;
use swc_ecmascript::transforms::modules::umd::Config as UmdConfig;

#[cfg(all(unix, not(target_env = "musl")))]
#[global_allocator]
static ALLOC: jemallocator::Jemalloc = jemallocator::Jemalloc;

static COMPILER: OnceCell<Compiler> = OnceCell::new();

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
    let c = COMPILER.get_or_init(|| {
      let cm = Arc::new(SourceMap::new(FilePathMapping::empty()));
      let handler = Handler::with_tty_emitter(
        swc_common::errors::ColorConfig::Always,
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
      source,
    );
    c.process_js_file(fm, register_options)
      .map_err(|e| Error::new(Status::GenericFailure, format!("Process js failed {}", e)))
  }
}

impl Task for TransformTask {
  type Output = TransformOutput;
  type JsValue = JsObject;

  fn compute(&mut self) -> Result<Self::Output> {
    TransformTask::perform(
      self.source.to_owned(),
      self.filename.as_str(),
      &self.options,
    )
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

#[js_function(8)]
fn transform_sync(ctx: CallContext) -> Result<JsObject> {
  let source = ctx.get::<JsBuffer>(0)?;
  let filename = ctx.get::<JsString>(1)?;
  let target = ctx.get::<JsString>(2)?;
  let module = ctx.get::<JsString>(3)?;
  let sourcemap = ctx.get::<JsBoolean>(4)?;
  let legacy_decorator = ctx.get::<JsBoolean>(5)?;
  let dynamic_import = ctx.get::<JsBoolean>(6)?;
  let tsx = ctx.get::<JsBoolean>(7)?;
  let options = build_options(
    filename,
    target,
    module,
    sourcemap,
    legacy_decorator,
    dynamic_import,
    tsx,
  )?;
  let output = TransformTask::perform(
    str::from_utf8(&source)
      .map_err(|e| Error::new(Status::InvalidArg, format!("Invalid source code {}", e)))?
      .to_owned(),
    filename.as_str()?,
    &options,
  )?;
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

#[js_function(8)]
fn transform(ctx: CallContext) -> Result<JsObject> {
  let source = ctx.get::<JsBuffer>(0)?;
  let filename = ctx.get::<JsString>(1)?;
  let target = ctx.get::<JsString>(2)?;
  let module = ctx.get::<JsString>(3)?;
  let sourcemap = ctx.get::<JsBoolean>(4)?;
  let legacy_decorator = ctx.get::<JsBoolean>(5)?;
  let dynamic_import = ctx.get::<JsBoolean>(6)?;
  let tsx = ctx.get::<JsBoolean>(7)?;
  let options = build_options(
    filename,
    target,
    module,
    sourcemap,
    legacy_decorator,
    dynamic_import,
    tsx,
  )?;
  let task = TransformTask::new(
    str::from_utf8(&source)
      .map_err(|e| Error::new(Status::InvalidArg, format!("Invalid source code {}", e)))?
      .to_owned(),
    filename.as_str()?.to_owned(),
    options,
  );
  ctx.env.spawn(task)
}

#[inline]
fn build_options(
  filename: JsString,
  target: JsString,
  module: JsString,
  sourcemap: JsBoolean,
  legacy_decorator: JsBoolean,
  dynamic_import: JsBoolean,
  tsx: JsBoolean,
) -> Result<Options> {
  let mut options = Options::default();
  let mut config = Config::default();
  let mut transform_config = TransformConfig::default();
  let target = match target.as_str()? {
    "es3" => JscTarget::Es3,
    "es5" => JscTarget::Es5,
    "es2015" => JscTarget::Es2015,
    "es2016" => JscTarget::Es2016,
    "es2017" => JscTarget::Es2017,
    "es2018" => JscTarget::Es2018,
    "es2019" => JscTarget::Es2019,
    "es2020" => JscTarget::Es2020,
    _ => {
      return Err(Error::new(
        Status::InvalidArg,
        format!("Invalid target: {}", target.as_str()?),
      ))
    }
  };
  let module = match module.as_str()? {
    "amd" => ModuleConfig::Amd(AmdConfig::default()),
    "commonjs" => ModuleConfig::CommonJs(CommonJsConfig::default()),
    "umd" => ModuleConfig::Umd(UmdConfig::default()),
    "es6" => ModuleConfig::Es6,
    _ => {
      return Err(Error::new(
        Status::InvalidArg,
        format!("Invalid module: {}", module.as_str()?),
      ))
    }
  };
  options.is_module = true;
  options.source_maps = Some(SourceMapsConfig::Bool(sourcemap.get_value()?));
  transform_config.legacy_decorator = legacy_decorator.get_value()?;
  config.jsc = JscConfig::default();
  config.jsc.target = target;
  config.jsc.transform = Some(transform_config);
  config.jsc.syntax = Some(Syntax::Typescript(TsConfig {
    tsx: tsx.get_value()?,
    decorators: legacy_decorator.get_value()?,
    dynamic_import: dynamic_import.get_value()?,
    dts: false,
    no_early_errors: true,
  }));
  config.module = Some(module);
  options.config = Some(config);
  options.disable_hygiene = false;
  options.filename = filename.as_str()?.to_owned();
  Ok(options)
}
