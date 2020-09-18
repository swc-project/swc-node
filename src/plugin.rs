use std::path::PathBuf;
use std::str::FromStr;
use std::sync::Arc;

use napi::{CallContext, Error, JsExternal, JsObject, JsString, Result, Status};
use serde_json;
use swc::config::Options;
use swc::Compiler;
use swc::TransformOutput;
use swc_common::FileName;
use swc_common::SourceFile;
use swc_ecma_visit::Fold;

use crate::get_compiler;

pub trait Plugin: Fold + 'static {
  fn with_options(&mut self, options: &Options) -> Result<()>;
}

#[inline(always)]
pub fn create_plugin<P>(ctx: &CallContext, plugin: P) -> Result<JsExternal>
where
  P: Plugin,
{
  ctx.env.create_external(Box::into_raw(Box::new(plugin)))
}

struct Factory(Vec<Box<dyn Plugin>>, Options);

impl Factory {
  #[inline(always)]
  fn transform(
    &mut self,
    filename: String,
    source: Arc<SourceFile>,
    compiler: &Compiler,
  ) -> Result<TransformOutput> {
    let config = self.1.config.as_ref().unwrap();
    self.1.filename = filename;
    let mut program = compiler
      .parse_js(
        source,
        config.jsc.target,
        config.jsc.syntax.unwrap(),
        true,
        false,
      )
      .map_err(|err| Error::new(Status::InvalidArg, format!("{}", err)))?;
    for plugin in &mut self.0 {
      program = compiler.transform(program, false, plugin);
    }
    compiler
      .process_js(program, &self.1)
      .map_err(|e| Error::new(Status::InvalidArg, format!("{}", e)))
  }
}

#[js_function(2)]
pub fn transform_factory(ctx: CallContext) -> Result<JsExternal> {
  let plugins = ctx.get::<JsObject>(0)?;
  let options = ctx.get::<JsString>(1)?;
  let swc_options: Options = serde_json::from_str(options.as_str()?)
    .map_err(|e| Error::new(Status::InvalidArg, format!("{}", e)))?;

  let len = plugins.get_array_length_unchecked()?;
  let native_plugins = Vec::with_capacity(len as _);
  for index in 0..len {
    let js_external = plugins.get_element::<JsExternal>(index)?;
    let plugin_ptr = ctx.env.get_value_external::<*mut _>(&js_external)?;
    let mut plugin_native: Box<dyn Plugin> = unsafe { Box::from_raw(*plugin_ptr) };
    Plugin::with_options(plugin_native.as_mut(), &swc_options)?;
  }
  ctx
    .env
    .create_external(Factory(native_plugins, swc_options))
}

#[js_function(3)]
pub fn transform_sync_with_plugins(ctx: CallContext) -> Result<JsObject> {
  let factory_external = ctx.get::<JsExternal>(0)?;
  let filename = ctx.get::<JsString>(1)?;
  let source = ctx.get::<JsString>(2)?;
  let factory: &mut Factory = ctx.env.get_value_external(&factory_external)?;
  let c = get_compiler();
  let fm = c.cm.new_source_file(
    FileName::Real(
      PathBuf::from_str(filename.as_str()?)
        .map_err(|e| Error::new(Status::InvalidArg, format!("Invalid path {}", e)))?,
    ),
    source.as_str()?.to_owned(),
  );
  let output = factory.transform(filename.as_str()?.to_owned(), fm, c)?;

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
