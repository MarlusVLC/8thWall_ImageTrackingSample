// This is a component file. You can use this file to define a custom component for your project.
// This component will appear as a custom component in the editor.

import * as ecs from '@8thwall/ecs'  // This is how you access the ecs library.

ecs.registerComponent({
  name: 'general-tester',
  // schema: {
  // },
  // schemaDefaults: {
  // },
  // data: {
  // },
  add: (world, component) => {
    const camera = ecs.Camera.get(world, component.eid);
    ecs.Camera.mutate(world, component.eid, (Cam) =>{
      Cam.enableVps = true;
    });
  },
  // tick: (world, component) => {
  // },
  // remove: (world, component) => {
  // },
  // stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
  //   ecs.defineState('default').initial()
  // },
})
