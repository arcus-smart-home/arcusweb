import _ from 'lodash';
import sceneData from 'i2web/models/fixtures/data/scene/scenes.json';
import templateData from 'i2web/models/fixtures/data/scene/templates.json';

export default {
  init() {
    const scenesClone = _.cloneDeep(sceneData);
    const templatesClone = _.cloneDeep(templateData);

    return {
      address: 'SERV:scene',
      'scene:ListScenes': function sceneListScenes({ placeId }) {
        const scenes = scenesClone[placeId] || { scenes: [] };
        return {
          messageType: 'scene:ListScenesResponse',
          attributes: scenes,
        };
      },
      'scene:ListSceneTemplates': function sceneListSceneTemplates({ placeId }) {
        const sceneTemplates = templatesClone[placeId] || { sceneTemplates: [] };
        return {
          messageType: 'scene:ListSceneTemplatesResponse',
          attributes: sceneTemplates,
        };
      },
    };
  },
};
