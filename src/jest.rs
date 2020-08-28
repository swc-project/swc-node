use std::collections::HashSet;
use std::path::PathBuf;
use std::str::FromStr;

use napi::{Error, Result, Status};
use once_cell::sync::OnceCell;
use swc::{config::Options, TransformOutput};
use swc_common::{self, FileName};
use swc_ecma_visit::Fold;
use swc_ecmascript::ast::{Expr, ExprOrSuper, Module, ModuleItem, Stmt};

use crate::get_compiler;

const JEST: &'static str = "jest";

static HOIST_METHODS: OnceCell<HashSet<&'static str>> = OnceCell::new();

pub fn jest_transform(
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

  let jest_hoist_transformer = JestHoistTransformer;

  c.process_js_with_custom_pass(fm, register_options, jest_hoist_transformer)
    .map_err(|e| Error::new(Status::GenericFailure, format!("Process js failed {}", e)))
}

struct JestHoistTransformer;

impl Fold for JestHoistTransformer {
  fn fold_module(&mut self, mut n: Module) -> Module {
    let hoist_methods = HOIST_METHODS.get_or_init(|| {
      let mut hash_set = HashSet::with_capacity(5);
      hash_set.insert("mock");
      hash_set.insert("unmock");
      hash_set.insert("enableAutomock");
      hash_set.insert("disableAutomock");
      hash_set.insert("deepUnmock");
      hash_set
    });
    let mut new_body = Vec::with_capacity(n.body.len());
    let mut stmts_to_hoist = Vec::with_capacity(n.body.len());
    n.body.iter().for_each(|item| match item {
      ModuleItem::Stmt(Stmt::Expr(expr_stmt)) => match &*expr_stmt.expr {
        Expr::Call(call_expr) => {
          if let ExprOrSuper::Expr(expr) = &call_expr.callee {
            if let Expr::Member(member) = expr.as_ref() {
              if let ExprOrSuper::Expr(expr) = &member.obj {
                if let Expr::Ident(ident) = expr.as_ref() {
                  let name = ident.sym.as_ref();
                  let is_jest = name == JEST;
                  if is_jest {
                    if let Expr::Ident(ident) = member.prop.as_ref() {
                      let func_name = ident.sym.as_ref();
                      if hoist_methods.get(func_name).is_some() {
                        stmts_to_hoist.insert(0, item.clone());
                        return ();
                      }
                    }
                  }
                }
              }
            }
          }
          new_body.push(item.clone());
        }
        _ => new_body.push(item.clone()),
      },
      _ => new_body.push(item.clone()),
    });

    for stmt in stmts_to_hoist {
      new_body.insert(0, stmt);
    }

    n.body = new_body;

    n
  }
}
