import _ from 'lodash';
import routerUtils from '../../util';
import userData from 'i2web/models/fixtures/data/user.json';
import personData from 'i2web/models/fixtures/data/person.json';
import placeData from 'i2web/models/fixtures/data/place/place.json';

export default {
  init() {
    const data = {
      user: _.cloneDeep(userData),
      person: _.cloneDeep(personData),
      place: _.cloneDeep(placeData),
    };
    return {
      address: 'SERV:sess',
      'sess:SetActivePlace': function sessSetActivePlace(params) {
        const currentPerson = this.state.currentPerson;
        const person = _.find(data.person, ['base:id', currentPerson]);

        if (person['person:placesWithPin'].indexOf(params.placeId) === -1) {
          return routerUtils.nullPointerResponse();
        }

        this.state.currentPlace = params.placeId;

        return {
          messageType: 'sess:SetActivePlaceResponse',
          attributes: {
            placeId: params.placeId,
          },
        };
      },
      'sess:ListAvailablePlaces': function sessListAvailablePlaces() {
        const currentToken = this.state.currentToken;
        const user = _.find(data.user, ['token', currentToken]).session;

        // TODO: What if the person has no places

        const places = user.places.map((place) => {
          const details = _.find(data.place, ['base:id', place.placeId]);
          return {
            city: details['place:city'],
            name: details['place:name'],
            placeId: details['base:id'],
            primary: true,
            role: place.role,
            state: details['place:state'],
            streetAddress1: details['place:streetAddress1'],
            streetAddress2: details['place:streetAddress2'],
            zipCode: details['place:zipCode'],
          };
        });

        return {
          messageType: 'sess:SetActivePlaceResponse',
          attributes: {
            places,
          },
        };
      },
    };
  },
};
