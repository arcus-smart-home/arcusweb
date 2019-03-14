import routerUtils from '../../util';
import _ from 'lodash';
import subsystemsData from 'i2web/models/fixtures/data/subsystem.json';

export default {
  init() {
    const data = _.cloneDeep(subsystemsData);
    return {
      address: 'SERV:subs',
      'subs:ListSubsystems': function subsListSubsystems(params) {
        const subsystems = data[params.placeId];

        if (!subsystems) {
          return routerUtils.notFoundResponse();
        }

        return {
          messageType: 'subs:ListSubsystemsResponse',
          attributes: subsystems,
        };
      },
    };
  },
};
