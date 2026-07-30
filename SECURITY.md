# Security Policy

## Supported Versions

Security fixes are provided for the latest released version of @swc-node/* packages and the
`main` branch.

Older releases may receive fixes at the maintainers' discretion, but they are
not guaranteed to receive security updates.

## Reporting a Vulnerability

Please do not report security vulnerabilities in a public GitHub issue.

Report suspected vulnerabilities privately by emailing:

<github@lyn.one>

Please include enough information for maintainers to reproduce and assess the
issue, such as:

- The affected package, crate, version, or commit
- Steps to reproduce the issue
- The expected and actual behavior
- The security impact
- Any suggested fix, mitigation, or related context

Maintainers will review the report and coordinate investigation, fixes, and
public disclosure when appropriate.

## Security Model

@swc-node/* packages are tools. They do not support processing untrusted input and do
not provide isolation, resource containment, or other sandbox guarantees. They are
not designed to be a SaaS platform, a multi-tenant sandbox, or a security
boundary for executing or transforming arbitrary untrusted input. This applies
regardless of the input language, syntax, file type, or package used to
process it.

If you operate @swc-node/* in a service that accepts input from untrusted users or
tenants, you are responsible for validating that input before passing it to @swc-node/*
and for applying appropriate isolation, resource limits, privilege separation,
and operational controls around the process.

## Scope

Security reports are in scope when they affect the packages in this repository (@swc-node/*), including:

- Official @swc-node/* npm packages

**Note:** This repository specifically maintains the `@swc-node/*` npm packages. It does NOT maintain the upstream [swc-project/swc](https://github.com/swc-project/swc) project (including its Rust crates, bindings, parser, bundler, or minifier). If you find a vulnerability in the upstream SWC project, please report it to their security channel instead.

## Out of Scope

The following reports are generally out of scope:

- Issues that depend only on using @swc-node/* as an unsandboxed public service for
  arbitrary untrusted input
- Issues that affect only unsupported versions
- Reports without a practical security impact
- Known dependency vulnerabilities without a demonstrated impact on @swc-node/*
