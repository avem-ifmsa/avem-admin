import 'bootstrap/less/bootstrap.less';

import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';
import {ListenerMixin} from 'reflux';
import {ButtonLink} from 'react-router-bootstrap';
import {Button, ButtonGroup, Modal, Table} from 'react-bootstrap';

import {SearchBox} from '../../common';
import {RoleActions} from '../../../actions';
import {RoleSearchStore} from '../../../stores';

export default React.createClass({
	mixins: [ListenerMixin],

	getInitialState: function() {
		return {
			roles: [],
			removeRole: false,
		};
	},

	componentDidMount: function() {
		this.listenTo(RoleSearchStore, this.onRolesChanged);
		RoleActions.searchRoles({ name: '*' });
	},

	onRolesChanged: function() {
		this.setState({ roles: RoleSearchStore.roles });
	},

	onRemoveRole: function(role) {
		this.setState({ removeRole: role });
	},

	onDoRemoveRole: function() {
		RoleActions.removeRole(this.state.removeRole.id);
		this.setState({ removeRole: false });
	},

	onDoNotRemoveRole: function() {
		this.setState({ removeRole: false });
	},

	onSearchRoles: function(params) {
		RoleActions.searchRoles(params);
	},

	render: function() {
		let canAddRole = _.includes(this.props.privileges, 'role:add');
		let canEditRole = _.includes(this.props.privileges, 'role:edit');
		let canRemoveRole = _.includes(this.props.privileges, 'role:remove');
		return (
			<div>
				<SearchBox ops={{ name: { multi: false },
				                  trusted: { multi: false } }}
				           default="name" onSearch={this.onSearchRoles}
				           placeholder='Role search, ie: admin, guest...'
				/>
				<Table hover responsive>
					<thead>
						<tr>
							<th>Name</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
					{ _.map(this.state.roles, (role, index) => {
						return (
							<tr key={index}>
								<td>{role.name}</td>
								<td>{role.description}</td>
								<td>
									<ButtonGroup fill>
										<ButtonLink bsSize="small"
										            to="role-edit"
										            disabled={!canEditRole}
										            params={{ id: role.id }}
										            query={{ 'return_to': 'role-search' }}
										>Edit</ButtonLink>
										<Button bsSize="small"
										        bsStyle="danger"
										        disabled={!canRemoveRole}
										        onClick={this.onRemoveRole.bind(this, role)}
										>Remove</Button>
									</ButtonGroup>
								</td>
							</tr>
						);
					}) }
					</tbody>
				</Table>
				<Modal show={!!this.state.removeRole}
				       onHide={this.onDoNotRemoveRole}
				>
					<Modal.Header>
						<Modal.Title>
							Remove role "{this.state.removeRole.name}"
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						This action cannot be undone. Removing a role can
						corrupt the database. Do you want to continue?
					</Modal.Body>
					<Modal.Footer>
						<Button bsStyle="danger"
						        onClick={this.onDoRemoveRole}
						>Remove role</Button>
						<Button onClick={this.onDoNotRemoveRole}
						>Do not remove</Button>
					</Modal.Footer>
				</Modal>
				<ButtonLink to="role-new"
				            disabled={!canAddRole}
				            query={{ return_to: 'role-search' }}
				>Add new role</ButtonLink>
			</div>
		);
	},
});