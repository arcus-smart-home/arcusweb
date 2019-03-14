import _ from 'lodash';
import categoryData from 'i2web/models/fixtures/data/rule/categories.json';
import ruleData from 'i2web/models/fixtures/data/rule/rules.json';
import templateData from 'i2web/models/fixtures/data/rule/templates.json';

export default {
  init() {
    const rulesClone = _.cloneDeep(ruleData);
    const templatesClone = _.cloneDeep(templateData);

    return {
      address: 'SERV:rule',
      'rule:GetCategories': function ruleGetCategories({ placeId }) {
        const categories = categoryData[placeId] || { categories: [] };
        return {
          messageType: 'rule:GetCategoriesResponse',
          attributes: categories,
        };
      },
      'rule:ListRules': function ruleListRules({ placeId }) {
        const rules = rulesClone[placeId] || { rules: [] };
        return {
          messageType: 'rule:ListRulesResponse',
          attributes: rules,
        };
      },
      'rule:ListRuleTemplates': function ruleListRuleTemplates({ placeId }) {
        const ruleTemplates = templatesClone[placeId] || { ruleTemplates: [] };
        return {
          messageType: 'rule:ListRuleTemplatesResponse',
          attributes: ruleTemplates,
        };
      },
    };
  },
};
