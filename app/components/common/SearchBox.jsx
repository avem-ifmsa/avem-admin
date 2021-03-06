import 'bootstrap/less/bootstrap.less';

import _ from 'lodash';
import React from 'react';
import {Button, Glyphicon, Input} from 'react-bootstrap';

export default React.createClass({
	propTypes: {
		placeholder: React.PropTypes.string,
		onSearch: React.PropTypes.func.isRequired,
		ops: React.PropTypes.objectOf(React.PropTypes.shape({
			multi: React.PropTypes.bool,
			merge: React.PropTypes.string,
		})).isRequired,
		default: (props, propName, componentName) => {
			let defaultOp = props[propName];
			if (!_.isString(defaultOp))
				return new TypeError('default prop should be String');
			if (!props.ops[defaultOp])
				return new Error('default prop should have be an ops entry');
			return null;
		},
	},
	
	getDefaultProps: function() {
		return {
			default: 'default',
			ops: {
				default: {
					multi: true,
					merge: 'append',
				},
			},
		};
	},
	
	getInitialState: function() {
		return {
			searchString: '',
		};
	},
	
	parseData: function(searchString) {
		let match, data = {};
		let re = /(?:([^:\s]+):)?(?:([^\s"]+)|"([^"]*)")/g;
		while (match = re.exec(searchString)) {
			let op = match[1] || this.props.default;
			let value = match[2] || match[3];
			let opInfo = this.props.ops[op];
			if (!opInfo) {
				value = match[0];
				op = this.props.default;
				opInfo = this.props.ops[op];
			}
			if (opInfo.multi) {
				if (data[op] === undefined)
					data[op] = [value];
				else
					data[op].push(value);
			} else {
				data[op] = value;
			}
		}
		return data;
	},
	
	onSubmitForm: function(event) {
		event.preventDefault();
		this.onSubmitSearch(event);
	},
	
	onSubmitSearch: function(event) {
		let searchData = this.parseData(this.state.searchString);
		this.props.onSearch(searchData);
	},
	
	onSearchStringChanged: function(event) {
		this.setState({ searchString: event.target.value });
	},
	
	render: function() {
		return (
			<form onSubmit={this.onSubmitForm}>
				<Input autoSave
				       type="search"
				       value={this.state.searchString}
				       placeholder={this.props.placeholder}
				       onChange={this.onSearchStringChanged}
				       buttonAfter={
				           <Button onClick={this.onSubmitSearch}>
				               <Glyphicon glyph="search"/>
				           </Button>
				       }
				/>
			</form>
		);
	},
});
