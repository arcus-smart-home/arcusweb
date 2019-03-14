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

function getWriteable(attrs) {
  return attrs.filter((attr) => {
    return attr.readwrite && attr.readwrite !== 'r';
  }) || [];
}

function attributes(prefix, attrs) {
	if (!attrs || typeof attrs[0] !== `object`) { return []; }

  return attrs[0][`${prefix}attribute`].map(attr => {
		return attr[`$`];
	});
}

function parameters(prefix, params) {
	if (!params) { return { "parameters": [] }; }

	let result = {};
	let p = params[0][`${prefix}parameter`];
	let r = params[0][`${prefix}return`];

	if (p) {
		result.parameters = p.map(param => {
			if(param[`$`].optional) {
				param[`$`].optional = param[`$`].optional === "true";
			}
			return param[`$`];
		});
	}
	if (r) {
		result.returns = r.map(ret => {
			return ret[`$`];
		});
	}
	return result;
}

function returns(rets) {
	if (!rets) { return { "returns": [] }; }

	let result = [];
	if (rets) { result = rets; }

	return {
		"returns": result.map(ret => {
			return ret[`$`];
		})
	}
}

function methods(prefix, methods) {
	if (!methods || typeof methods[0] !== `object`) { return []; }

	let result = { "methods": [], "attributes": [] };
	let a = methods[0][`${prefix}attribute`];
	// InvitationService.js does not have a `<s:methods>` surrounding its `<s:method>`
	// attributes so we must compensate with ` ... || methods`
	let m = methods[0][`${prefix}method`] || methods;

	if (a) {
		result.attributes = a.map((attr) => {
			return attr[`$`];
		});
	}

	if (m) {
		result.methods = m.map((method) => {
			let params = parameters(prefix, method[`${prefix}parameters`]);
			let rets = returns(method[`${prefix}return`]);
			let param = method[`${prefix}parameter`];
			if (param) {
				params.parameters = params.parameters.concat(param.map(p => {
					if(p[`$`].optional) {
						p[`$`].optional = p[`$`].optional === "true";
					}

					return p[`$`];
				}));
			}
			return Object.assign(method[`$`], params, rets);
		});
	}
	return result;
}

function events(prefix, events) {
	if (!events || typeof events[0] !== `object`) { return []; }

	return events[0][`${prefix}event`].map(event => {
		return Object.assign(event["$"], parameters(event[`${prefix}parameter`]));
	});
}

function metadata(prefix, name, body) {
	let base = { "name": name }
	let ns = body[`$`][`namespace`];
	if (ns) {
		base = Object.assign(base, { "namespace": ns });
	}

	let desc = body[`${prefix}description`];
	if (desc) {
		base = Object.assign(base, { "description": desc[0].trim() });
	}

	let enhances = body[`$`][`enhances`];
	if (enhances) {
		base = Object.assign(base, { "enhances": enhances });
	}
	return base;
}

module.exports = function(type, name, json) {
	let prefix = type.split(`:`)[0] + `:`;
	let body = json[type];


	let result = {
		"type": type.split(`:`)[1],
		"metadata": metadata(prefix, name, body),
		"events": events(prefix, body[`${prefix}events`]).filter(Boolean),
    "attributes": [],
		"methods": []
	};


	let m = methods(prefix, body[`${prefix}methods`] || body[`${prefix}method`]);
  m.attributes = m.attributes ? m.attributes : [];
  let a = attributes(prefix, body[`${prefix}attributes`]);
	result.methods = result.methods.concat(m.methods).filter(Boolean);
	result.attributes = a.concat(m.attributes).filter(Boolean);
  result.writeable = getWriteable(result.attributes);



	return result;
};