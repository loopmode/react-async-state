'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var groups = {
    default: []
};

var AsyncState = function (_Component) {
    _inherits(AsyncState, _Component);

    function AsyncState() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, AsyncState);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = AsyncState.__proto__ || Object.getPrototypeOf(AsyncState)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
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
                _this.clearTimeouts();
                _this.setState({ isPending: true });
                if (_this.props.group) {
                    _this.setGroupPending(_this.props.group, true);
                }
                // setup success mechanism
                promise.then(function () {
                    // console.info('success!');
                    _this.setStateSafely({ isPending: false, hintSuccess: true, hintError: false });
                    _this.setGroupPending(_this.props.group, false);
                    _this._successTimeout = window.setTimeout(function () {
                        return _this.setStateSafely({ hintSuccess: false });
                    }, _this.props.successDuration);
                });
                // setup error mechanism
                promise.catch(function () {
                    // console.info('success!');
                    _this.setStateSafely({ isPending: false, hintError: true, hintSuccess: false });
                    _this.setGroupPending(_this.props.group, false);
                    _this._errorTimeout = window.setTimeout(function () {
                        return _this.setStateSafely({ hintError: false });
                    }, _this.props.errorDuration);
                });
            }
            return callbackResult;
        }, _this.clearTimeouts = function () {
            window.clearTimeout(_this._successTimeout);
            window.clearTimeout(_this._errorTimeout);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(AsyncState, [{
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

            var childProps = _objectWithoutProperties(this.child.props, []);

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
            childProps.className = (0, _classnames2.default)(childProps.className, _defineProperty({}, successClass, this.state.hintSuccess), _defineProperty({}, errorClass, this.state.hintError));
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
            switch (typeof group === 'undefined' ? 'undefined' : _typeof(group)) {
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
                groups[groupName] = [].concat(_toConsumableArray(groups[groupName] || []), [this]);
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
    trigger: _propTypes2.default.string
};
AsyncState.defaultProps = {
    successClass: 'success',
    successDuration: 1000,
    errorClass: 'danger',
    errorDuration: 1000,
    pendingProp: ['isPending', 'disabled'],
    pendingGroupProp: ['disabled'],
    trigger: 'onClick'
};
exports.default = AsyncState;