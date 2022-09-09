import { TabId } from '@blueprintjs/core';

// import p2Source from '../assets/phaser/p2.d.txt';
// import pixiSource from '../assets/phaser/pixi.comments.d.txt';
// import phaserCESource from '../assets/phaser/phaser.comments.d.txt';

// apply compiler options as typescript sensible!
// monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
//   target: monaco.languages.typescript.ScriptTarget.ES2015,
//   allowNonTsExtensions: true,
// });
// add phaser-ce library:
// https://github.com/photonstorm/phaser-ce/tree/master/typescript
// monaco.languages.typescript.javascriptDefaults.addExtraLib(
//   p2Source,
//   'ts:phaser/p2.d.txt'
// );
// monaco.languages.typescript.javascriptDefaults.addExtraLib(
//   pixiSource,
//   'ts:phaser/pixi.comments.d.txt'
// );
// monaco.languages.typescript.javascriptDefaults.addExtraLib(
//   phaserCESource,
//   'ts:phaser/phaser.comments.d.txt'
// );

/**
 * ************* TEMPORAL CODE STORE ***********************
 */
export const templetCode: { [key: TabId]: string } = {
  main: '// main scene code',
  success: '// sucess scene code',
  failure: '// failure scene code',
};
