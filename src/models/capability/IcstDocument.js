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

import Bridge from 'i2web/cornea/bridge';

/**
 * @module {Object} i2web/models/IcstDocument IcstDocument
 * @parent app.models.capabilities
 *
 * Model of an ICST document. Documents are complex JSON, XML, or other formatted strings, such as
the definitions for the options when a customer session ends.
These are generally meant to be retrieved and updated one at a time since they
are usually large datasets. Send them to the database in gzip/Base64 format,
and that is how they will come to the client.
Only one of each document type can be stored at a time, since these are
system level documents.
Documents cannot currently be deleted, since they are required for the system
to operate.
 */
export default {
  writeableAttributes: [
    /**
     * @property {enum} icstdoc\:docType
     *
     * The type of document
     *
     */
    'icstdoc:docType',
    /**
     * @property {string} icstdoc\:document
     *
     * The gzipped, B64 version of the text document
     *
     */
    'icstdoc:document',
    /**
     * @property {uuid} icstdoc\:approvedBy
     *
     * agent id that should approve the document (if approved is false) or did approve the document (if approved is true). The agent making the changes sets this field to indicate the document is ready for review.
     *
     */
    'icstdoc:approvedBy',
  ],
  methods: {
    /**
     * @function CreateDocument
     *
     * Add a document to the support_document_versions table with approved set to false. The &#x27;modifiedBy&#x27; and &#x27;version&#x27; attributes are autoset.
     *
     * @param {uuid} [id] unique id
     * @param {enum} docType the type of the document
     * @param {string} document The gzipped, B64 version of the text document
     * @return {Promise}
     */
    CreateDocument(id, docType, document) {
      return Bridge.request('icstdoc:CreateDocument', this.GetDestination(), {
        id,
        docType,
        document,
      });
    },
    /**
     * @function ApproveDocument
     *
     * Promote a document to the support_documents table. The document will also still be in the support_document_versions table. &#x27;approved&#x27; is autoset, &#x27;approvedBy&#x27; is already set.
     *
     * @return {Promise}
     */
    ApproveDocument() {
      return Bridge.request('icstdoc:ApproveDocument', this.GetDestination(), {});
    },
    /**
     * @function RejectDocument
     *
     * Reject an unapproved document by setting &#x27;approvedBy&#x27; to null. The &#x27;modifiedBy&#x27; field will not be changed (otherwise this would just be a SetAttributes call).
     *
     * @return {Promise}
     */
    RejectDocument() {
      return Bridge.request('icstdoc:RejectDocument', this.GetDestination(), {});
    },
    /**
     * @function ListDocumentMetadata
     *
     * Retrieves a list of document info without the documents themselves.
     *
     * @param {string} [docType] only retrieve documents of one type
     * @return {Promise}
     */
    ListDocumentMetadata(docType) {
      return Bridge.request('icstdoc:ListDocumentMetadata', this.GetDestination(), {
        docType,
      });
    },
    /**
     * @function DeleteDocument
     *
     * Removes a document. Only allowed if the document has not been approved.
     *
     * @return {Promise}
     */
    DeleteDocument() {
      return Bridge.request('icstdoc:DeleteDocument', this.GetDestination(), {});
    },
  },
  events: {},
  DOCTYPE_ENDSESSION: 'ENDSESSION',
  DOCTYPE_SMARTPLUG: 'SMARTPLUG',
  DOCTYPE_FIRMWARE: 'FIRMWARE',
};
