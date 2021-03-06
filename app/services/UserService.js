import _ from 'lodash';
import request from 'superagent';
import jsonapify from 'superagent-jsonapify';

import config from '../../config';
import {CredentialStore} from '../stores';

jsonapify(request);

class UserService {
	createUser(userData) {
		return new Promise((resolve, reject) => {
			request.post(`${config.serverUrl}/users`)
				.set('Authorization', `Bearer ${CredentialStore.accessToken}`)
				.type('application/vnd.api+json').send({ data: userData })
				.end((err, res) => {
					err ? reject(err) : resolve(res.body);
				});
		});
	}
	
	readUser(userId) {
		return new Promise((resolve, reject) => {
			request.get(`${config.serverUrl}/users/${userId}`)
				.set('Authorization', `Bearer ${CredentialStore.accessToken}`)
				.type('application/vnd.api+json').end((err, res) => {
					err ? reject(err) : resolve(res.body);
				});
		});
	}
	
	updateUser(userId, data) {
		return new Promise((resolve, reject) => {
			request.put(`${config.serverUrl}/users/${userId}`)
				.set('Authorization', `Bearer ${CredentialStore.accessToken}`)
				.type('application/vnd.api+json').send({ data })
				.end((err, res) => {
					err ? reject(err) : resolve(res.body);
				});
		});
	}
	
	removeUser(userId) {
		return new Promise((resolve, reject) => {
			request.del(`${config.serverUrl}/users/${userId}`)
				.set('Authorization', `Bearer ${CredentialStore.accessToken}`)
				.end((err, res) => {
					err ? reject(err) : resolve(res.body);
				});
		});
	}
	
	searchUsers(query, limit, offset) {
		offset = offset || 0;
		return new Promise((resolve, reject) => {
			let filter = _.assign({
				'page[offset]': offset, 'page[limit]': limit
			}, _.mapKeys(query, (value, field) => `filter[${field}]`));
			request.get(`${config.serverUrl}/users`).query(filter)
				.set('Authorization', `Bearer ${CredentialStore.accessToken}`)
				.end((err, res) => {
					err ? reject(err) : resolve(res.body.data);
				});
		});
	}
};

export default new UserService;
