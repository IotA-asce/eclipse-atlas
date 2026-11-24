# Coordinate entry Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let visitors select an exact observing point with a keyboard.

**Architecture:** A native modal coordinate form opened from the existing intro calls App.selectLocation. Validate finite signed decimal degrees before selection; keep App as the single selected-point owner. Refresh uncontrolled inputs from the current selection on opening and derive the live globe announcement from props. No astronomy,observer orperformance-model changes.

**Tech Stack:** ExistingReact19/TypeScript/Vite8/Vitest,TestingLibrary andPlaywrightCLI.

---

1. Add CoordinateEntry.test.tsx andAppintegrationtests forvalid/invalid/boundary submissions,focus/errors,calculationretry andglobeformdefaults. Showmissingcomponenttestfailure first.
2. Add CoordinateEntry.tsx,wireAppheader,smallstyleextensions andderiveGlobeSceneselectedlabel fromprops. Useexistingcalculation/pin/TimeJumpstate;no dependenciesorstorage.
3. npmci;rununit/lint/build andexistinge2e. Serveproductiononloopback;PlaywrightCLIkeyboard-onlyselection,invalidsubmissionpreservation,TimeJumpreturn and360px layout/scroll reachability. Documentcoordinates/lowerprecisionlimits andcurrentperf/horizonvalidationgates.
4. Scanexplicitstagedpaths,commit/mergemain/push,verifyremoteSHA. Updatequeue/inventory/profile/receipt/selectiveLore andreleaseownlock.
