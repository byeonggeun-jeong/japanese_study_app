# Code signing policy

Status (2026-11-02): preparation only. No SignPath application has been submitted
or approved. Version 0.1.2 is unsigned and is blocked on the reported Smart App
Control configuration. No trusted signed download is available yet.

## Intended provider

We plan to apply to SignPath Foundation for free open-source code signing.
The provider attribution required after approval will be:
"Free code signing provided by SignPath.io, certificate by SignPath Foundation".
This is a proposed arrangement, not a claim that signing is currently provided.

## Scope and build origin

- Repository: https://github.com/byeonggeun-jeong/japanese_study_app
- Source license: MIT; third-party exceptions are in THIRD_PARTY_NOTICES.md.
- Public build: .github/workflows/windows-build.yml, from the main commit shown
  in the Actions run and build-info.json. It currently produces unsigned artifacts.
- Intended signing scope: our application executable and NSIS installer, including
  the uninstaller where required by the approved signing configuration.
- Bundled third-party binaries keep upstream signatures and licenses. We do not
  claim authorship or sign upstream binaries under our project's identity.
- Once approved, each signing request must be manually approved by the maintainer.
  A signed release must verify the installer and installed files' trusted signatures,
  timestamp, and launch on a PC with Smart App Control enabled before release.
- SHA-256 files identify build bytes; they are not Authenticode signatures.

The SignPath project, artifact rules, verified build integration and credentials
cannot be configured until the provider accepts the project. No placeholder
credentials or pretend signing step is included in the workflow.

## Roles

Proposed committer, reviewer and signing approver:
[byeonggeun-jeong](https://github.com/byeonggeun-jeong).
Changes from other contributors require maintainer review. The maintainer must
confirm multi-factor authentication on GitHub and SignPath before applying;
this has not been verified by the coding assistant.

## Privacy and installation

The app stores study progress in the local Windows user profile. It has no
analytics, account, cloud sync or online learning API. It bundles fonts and
learning content locally. Optional speech uses the operating system's installed
voice service; its operation follows Windows settings. Selecting a GitHub link
opens the system browser, where GitHub's privacy policy applies.

The application sends no study records to a server. Build and signing services
process public source and build artifacts, not private study records.

The installer creates program files and shortcuts at the selected user location.
Windows Settings > Apps can uninstall the application. Study data is stored
separately; see README.md for backup and storage paths. No instructions or build
steps disable Smart App Control or weaken Windows trust settings.
