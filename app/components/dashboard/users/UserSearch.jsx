import 'bootstrap/less/bootstrap.less';

import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';
import {ListenerMixin} from 'reflux';
import {LinkContainer} from 'react-router-bootstrap';
import {Alert, Button, ButtonGroup, Modal} from 'react-bootstrap';

import {UserActions} from '../../../actions';
import {UserSearchStore} from '../../../stores';
import {DataView, SearchBox} from '../../common';
import UserDataView from './UserDataView';

export default React.createClass({
	mixins: [ListenerMixin],

	getInitialState: function() {
		return {
			users: [],
			error: null,
			removeUser: false,
		};
	},

	componentDidMount: function() {
		this.listenTo(UserSearchStore, this.onUsersChanged);
		UserActions.removeUser.failed.listen(this.onDoRemoveUserFailed);
		UserActions.searchUsers.failed.listen(this.onSearchUsersFailed);
		UserActions.removeUser.completed.listen(this.onDoRemoveUserCompleted);
		UserActions.searchUsers({ email: '*' });
	},
	
	onSearchUsers: function(params) {
		UserActions.searchUsers(params);
	},
	
	onSearchUsersFailed: function(error) {
		this.setState({ error });
	},

	onUsersChanged: function() {
		this.setState({ users: UserSearchStore.users });
	},
	
	onRemoveUser: function(user) {
		this.setState({ removeUser: user });
	},
	
	onDoRemoveUser: function() {
		UserActions.removeUser(this.state.removeUser.id);
	},
	
	onDoRemoveUserCompleted: function() {
		this.setState({ removeUser: false });
	},

	onDoRemoveUserFailed: function(error) {
		this.setState({ error });
	},
	
	onDoNotRemoveUser: function() {
		this.setState({ removeUser: false });
	},
	
	onDismissError: function() {
		this.setState({ error: null });
	},

	render: function() {
		let canAddUser = _.includes(this.props.privileges, 'user:add');
		let canEditUser = _.includes(this.props.privileges, 'user:edit');
		let canRemoveUser = _.includes(this.props.privileges, 'user:remove');
		return (
			<div>
				<SearchBox default="email" onSearch={this.onSearchUsers}
				           placeholder='User search, ie: "user.email@domain.com"'
				           ops={{
				               role: { multi: false, merge: 'replace' },
				               email: { multi: false, merge: 'append' },
				           }}
				/>
				{ this.state.error ?
					<Alert bsStyle="warning"
					       onDismiss={this.onDismissError}
					>{ this.state.error.message || 'Unknown error' }</Alert>
				: '' }
				<DataView key={this.state.users}
				          data={this.state.users}
				>
					<DataView.Headers>
						{ UserDataView.Headers }
						<DataView.Header></DataView.Header>
					</DataView.Headers>
					<DataView.Each handler={ user => {
						return _.flatten([
							UserDataView.Data(user),
							<DataView.Data>
								<ButtonGroup fill>
									<LinkContainer to={`/users/${user.id}`}
										           query={{ return_to: '/users' }}
									>
										<Button bsSize='small'
											    disabled={!canEditUser}
										>Edit</Button>
									</LinkContainer>
									<Button bsSize="small"
										    bsStyle="danger"
										    disabled={!canRemoveUser}
										    onClick={this.onRemoveUser.bind(this, user)}
									>Remove</Button>
								</ButtonGroup>
							</DataView.Data>,
						]);
					}}/>
				</DataView>
				<LinkContainer to='/users/new'
				               query={{ return_to: '/users' }}
				>
					<Button disabled={!canAddUser}>Add new user</Button>
				</LinkContainer>
				<Modal show={!!this.state.removeUser}
				       onHide={this.onDoNotRemoveUser}
				>
					<Modal.Header>
						<Modal.Title>
							Remove user "{this.state.removeUser.email}"
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						This action cannot be undone. Removing an user can also
						potentially corrupt the database. Do you want to
						continue?
					</Modal.Body>
					<Modal.Footer>
						<Button bsStyle="danger"
						        onClick={this.onDoRemoveUser}
						>Remove user</Button>
						<Button onClick={this.onDoNotRemoveUser}
						>Do not remove</Button>
					</Modal.Footer>
				</Modal>
			</div>
		);
	},
});
