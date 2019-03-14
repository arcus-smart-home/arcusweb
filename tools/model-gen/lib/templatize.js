/**
 * Copyright 2019 Arcus Project
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

const path = require(`path`);
const fs = require(`fs`);
const handlebars = require(`handlebars`);
const beautify = require(`js-beautify`);

String.prototype.toCamelCase = function() {
  return this.replace(/^([A-Z])|[\s-_](\w)/g, function(match, p1, p2, offset) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
};

handlebars.registerHelper("type", (type, options) => {
	const escapedType = new handlebars.SafeString(type);
	return `{${escapedType}}`;
});

handlebars.registerHelper("destination", (options) => {
	switch (options.data.root.type) {
		case "service":
			return `SERV:${options.data.root.metadata.namespace}:`;
		case "capability":
			return `{base:address}`;
		default:
			return "";
	}
});

handlebars.registerHelper("trim", (text, options) => {
  const lines = text.replace(/(?:\r\n|\r|\n)/g, '\n').replace(/(?:\t)/g, '').split('\n').filter((line) => {
    return !!(line.trim().length);
  });

  return lines.map((line) => {
    return line.trim();
  }).join('\n');
});

handlebars.registerHelper("enumerations", (options) => {
	let values = []
	// options.data.root.methods.map((method) => {
	// 	const returns = method.returns;
	// 	if (returns && returns.length > 0) {
	// 		returns.map((r) => {
	// 			if (r.type === 'enum') {
	// 				values = `${values.concat(r.values.split(`,`).map(value => {
	// 					let val = value.trim();
	// 					return `${method.name.toUpperCase()}_${val.toUpperCase()}: '${val}'`;
	// 				}))},`;
	// 			}
	// 		});
	// 	}
	// });

	let attributes = options.data.root.attributes;
	attributes.map((attr) => {
		if (attr.type === `enum`) {
			values = `${values.concat(attr.values.split(`,`).map(value => {
        value = value.trim();
        return `${attr.name.toUpperCase()}_${value.toUpperCase().trim()}: '${value}'`;
      }))},`;
		}
	});
	return values;
});

handlebars.registerHelper("filenameAsVar", (filename, options) => {
	let parts = filename.split(".");
	return parts[0];
});

handlebars.registerHelper("isRESTful", (method, options) => {
	if (!method || !method.isRESTful) { return options.inverse(); }
	return (method.isRESTful === "true") ? options.fn() : options.inverse();
});

const formatParameters = function(parameters) {
  if (!parameters) { return ''; }
  return parameters.map((param) => {
    return param.name.toCamelCase();
  }).join(`, `);
};

handlebars.registerHelper("parameters", (parameters, options) => {
  return formatParameters(parameters);
});

handlebars.registerHelper("parametersTrailComma", (parameters, options) => {
  return formatParameters(parameters) + (parameters && parameters.length ? ',' : '');
});

handlebars.registerHelper("typeof", (thing, options) => {
	var type = options.data.root.type;
	return (thing !== type) ? options.inverse() : options.fn(this);
});

module.exports = function(obj, template) {
	try {
		let rendered = handlebars.compile(template)(obj);
		return beautify(rendered, {
			"indent_size": 2,
			"indent_with_tabs": false,
			"max_preserve_newlines": 2,
      "end_with_newline": true,
		});
	} catch (e) {
		console.log(e);
	}
};