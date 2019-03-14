import _ from 'lodash';
import config from 'i2web/config';
import fixture from 'can-fixture';
import routerUtils from '../../util';
import userData from 'i2web/models/fixtures/data/user.json';

export default {
  init() {
    const data = _.cloneDeep(userData);
    fixture(`POST ${config.apiUrl}/person/SendPasswordReset`, (request, response) => {
      response(200, routerUtils.emptyResponse());
    });

    fixture(`POST ${config.apiUrl}/person/ResetPassword`, (request, response) => {
      const attributes = routerUtils.getAttributes(request.data);
      const correlationId = routerUtils.getCorrelationId(request.data);
      let successful = true;
      const user = _.find(data, ['username', attributes.email]);

      if (!user) {
        successful = false;
        response(400, routerUtils.buildResponse(request.data, correlationId, {
          messageType: 'Error',
          attributes: {
            code: 'person.not_found',
            message: 'Unable to locate record for person',
          },
        }));
      }

      if (attributes.token !== 'abcde') {
        successful = false;
        response(400, routerUtils.buildResponse(request.data, correlationId, {
          messageType: 'Error',
          attributes: {
            code: 'person.reset.failed',
            message: 'Unable to reset password, perhaps try again.',
          },
        }));
      }

      if (successful) {
        user.password = attributes.password;
        response(200, routerUtils.emptyResponse());
      }
    });

    return {
      address: 'SERV:person',
      'person:ChangePassword': function personChangePassword(params) {
        return this.notImplemented(params);
      },
    };
  },
};
