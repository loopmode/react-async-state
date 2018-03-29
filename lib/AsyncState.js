'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var groups = {
    default: []
};

var AsyncState = function (_Component) {
    (0, _inherits3.default)(AsyncState, _Component);

    function AsyncState() {
        var _ref;

        var _temp, _this, _ret;

        (0, _classCallCheck3.default)(this, AsyncState);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = AsyncState.__proto__ || Object.getPrototypeOf(AsyncState)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            isPending: _this.initialPending,
            isPendingGroup: false,
            hintSuccess: false,
            hintError: false
        }, _this.handleTrigger = function (e) {
            var trigger = _this.props.trigger;

            var callback = _this.child.props[trigger];
            var callbackResult = typeof callback === 'function' && callback(e);
            var promise = _this.getPromise(callbackResult);
            // console.log('handleTrigger', {callback, callbackResult, promise});
            if (promise) {

                var handleResult = function handleResult() {
                    _this.setStateSafely({
                        isPending: false,
                        hintSuccess: true,
                        hintError: false
                    });
                    _this.setGroupPending(_this.props.group, false);
                    _this._successTimeout = window.setTimeout(function () {
                        _this.setStateSafely({ hintSuccess: false });
                    }, _this.props.successDuration);
                };
                var handleError = function handleError() {
                    _this.setStateSafely({
                        isPending: false,
                        hintError: true,
                        hintSuccess: false
                    });
                    _this.setGroupPending(_this.props.group, false);
                    _this._errorTimeout = window.setTimeout(function () {
                        _this.setStateSafely({ hintError: false });
                    }, _this.props.errorDuration);
                };

                _this.clearTimeouts();
                _this.setState({ isPending: true });
                if (_this.props.group) {
                    _this.setGroupPending(_this.props.group, true);
                }
                promise.catch(handleError);
                promise.then(function (result) {
                    if (_this.props.rejectResolvedErrors && result instanceof Error) {
                        return handleError(result);
                    }
                    return handleResult(result);
                });
            }
            return callbackResult;
        }, _this.clearTimeouts = function () {
            window.clearTimeout(_this._successTimeout);
            window.clearTimeout(_this._errorTimeout);
        }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
    }

    (0, _createClass3.default)(AsyncState, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this._isMounted = true;
            if (this.props.group) {
                this.registerGroup(this.props.group);
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.group !== this.props.group) {
                this.unregisterGroup(this.props.group);
                this.registerGroup(nextProps.group);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this._isMounted = false;
            this.clearTimeouts();
            if (this.props.group) {
                this.unregisterGroup(this.props.group);
            }
        }
    }, {
        key: 'setStateSafely',
        value: function setStateSafely(nextState) {
            this._isMounted && this.setState(nextState);
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.cloneElement(this.child, this.createChildProps(this.child));
        }
    }, {
        key: 'createChildProps',
        value: function createChildProps() {
            var _props = this.props,
                successClass = _props.successClass,
                errorClass = _props.errorClass,
                trigger = _props.trigger;
            var childProps = (0, _objectWithoutProperties3.default)(this.child.props, []);

            if (childProps[trigger]) {
                childProps[trigger] = this.handleTrigger;
            }
            var applyPendingProp = function applyPendingProp(props, value) {
                if (typeof value === 'string') {
                    props[value] = true;
                } else {
                    value.forEach(function (prop) {
                        return props[prop] = true;
                    });
                }
            };
            if (this.state.isPending) {
                applyPendingProp(childProps, this.props.pendingProp);
            }
            if (this.state.isPendingGroup) {
                applyPendingProp(childProps, this.props.pendingGroupProp);
            }
            childProps.className = (0, _classnames2.default)(childProps.className, (0, _defineProperty3.default)({}, successClass, this.state.hintSuccess), (0, _defineProperty3.default)({}, errorClass, this.state.hintError));
            return childProps;
        }
    }, {
        key: 'getPromise',
        value: function getPromise(value) {
            if (value && typeof value.then === 'function') {
                return value;
            }
            return undefined;
        }

        //-----------------------------------
        //
        // GROUP HANDLING
        //
        //-----------------------------------


    }, {
        key: 'getGroupName',
        value: function getGroupName(group) {
            switch (typeof group === 'undefined' ? 'undefined' : (0, _typeof3.default)(group)) {
                case 'boolean':
                    return 'default';
                case 'string':
                    return group;
                case 'function':
                    return this.getGroupName(group(this));
            }
        }
    }, {
        key: 'registerGroup',
        value: function registerGroup(group) {
            if (group) {
                var groupName = this.getGroupName(group);
                groups[groupName] = [].concat((0, _toConsumableArray3.default)(groups[groupName] || []), [this]);
            }
        }
    }, {
        key: 'unregisterGroup',
        value: function unregisterGroup(group) {
            var _this2 = this;

            if (group) {
                var groupName = this.getGroupName(group);
                groups[groupName] = (groups[groupName] || []).filter(function (component) {
                    return component !== _this2;
                });
            }
        }
    }, {
        key: 'setGroupPending',
        value: function setGroupPending(group, isPendingGroup) {
            var _this3 = this;

            var groupName = this.getGroupName(group);
            var groupMembers = groups[groupName];
            // console.info('setGroupPending', {groupName, groupMembers});
            if (groupMembers) {
                groupMembers.filter(function (component) {
                    return component !== _this3;
                }).forEach(function (component) {
                    // console.info('setGroupPending', {component, isPendingGroup});
                    component.setStateSafely({ isPendingGroup: isPendingGroup });
                });
            }
        }
    }, {
        key: 'child',
        get: function get() {
            return _react2.default.Children.only(this.props.children);
        }
    }]);
    return AsyncState;
}(_react.Component);

AsyncState.propTypes = {
    successDuration: _propTypes2.default.number,
    errorDuration: _propTypes2.default.number,
    successClass: _propTypes2.default.string,
    errorClass: _propTypes2.default.string,
    children: _propTypes2.default.element,
    initialPending: _propTypes2.default.bool,
    pendingProp: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.array]),
    pendingGroupProp: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.array]),
    group: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func, _propTypes2.default.bool]),
    trigger: _propTypes2.default.string,
    // if true, and a promise is resolved, but its payload is of type Error, the promise will be treated as if rejected
    rejectResolvedErrors: _propTypes2.default.string
};
AsyncState.defaultProps = {
    successClass: 'success',
    successDuration: 1000,
    errorClass: 'danger',
    errorDuration: 1000,
    pendingProp: ['isPending', 'disabled'],
    pendingGroupProp: ['disabled'],
    trigger: 'onClick',
    rejectResolvedErrors: true
};
exports.default = AsyncState;