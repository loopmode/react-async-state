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

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

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
            isPending: _this.props.initialPending,
            isPendingGroup: false,
            indicateSuccess: false,
            indicateError: false
        }, _this.handleTrigger = function (e) {
            var trigger = _this.props.trigger;

            var callback = _this.child.props[trigger];
            var callbackResult = typeof callback === 'function' && callback(e);
            var promise = _this.getPromise(callbackResult);
            // console.log('handleTrigger', {callback, callbackResult, promise});
            if (promise) {
                if (_this.props.onPending) {
                    _this.props.onPending();
                }
                var handleResult = function handleResult(result) {
                    if (_this.props.onSuccess) {
                        _this.props.onSuccess(result);
                    }
                    if (_this.props.onFinished) {
                        _this.props.onFinished({ result: result });
                    }
                    _this.setState({
                        isPending: false,
                        indicateSuccess: true,
                        indicateError: false
                    });
                    _this.setGroupPending(_this.props.group, false);
                    _this._successTimeout = window.setTimeout(function () {
                        _this.setState({ indicateSuccess: false });
                        if (_this.props.onSuccessEnd) {
                            _this.props.onSuccessEnd();
                        }
                    }, _this.props.successDuration);
                };
                var handleError = function handleError(error) {
                    if (_this.props.onError) {
                        _this.props.onError(error);
                    }
                    if (_this.props.onFinished) {
                        _this.props.onFinished({ error: error });
                    }
                    _this.setState({
                        isPending: false,
                        indicateError: true,
                        indicateSuccess: false
                    });
                    _this.setGroupPending(_this.props.group, false);
                    _this._errorTimeout = window.setTimeout(function () {
                        _this.setState({ indicateError: false });
                        if (_this.props.onErrorEnd) {
                            _this.props.onErrorEnd();
                        }
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
        key: 'setState',
        value: function setState(nextState) {
            this._isMounted && (0, _get3.default)(AsyncState.prototype.__proto__ || Object.getPrototypeOf(AsyncState.prototype), 'setState', this).call(this, nextState);
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
                successProps = _props.successProps,
                errorClass = _props.errorClass,
                errorProps = _props.errorProps,
                trigger = _props.trigger;
            var childProps = (0, _objectWithoutProperties3.default)(this.child.props, []);
            var _state = this.state,
                indicateSuccess = _state.indicateSuccess,
                indicateError = _state.indicateError;

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
            childProps.className = (0, _classnames2.default)(childProps.className, (0, _defineProperty3.default)({}, successClass, indicateSuccess), (0, _defineProperty3.default)({}, errorClass, indicateError));
            if (indicateSuccess && successProps) {
                Object.assign(childProps, typeof successProps === 'function' ? successProps(this.props, this.state) : successProps);
            }
            if (indicateError && errorProps) {
                Object.assign(childProps, typeof errorProps === 'function' ? errorProps(this.props, this.state) : errorProps);
            }

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
                    component.setState({ isPendingGroup: isPendingGroup });
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
    successProps: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
    errorClass: _propTypes2.default.string,
    errorProps: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
    children: _propTypes2.default.element,
    initialPending: _propTypes2.default.bool,
    pendingProp: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.array]),
    pendingGroupProp: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.array]),
    group: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func, _propTypes2.default.bool]),
    trigger: _propTypes2.default.string,
    // if true, and a promise is resolved, but its payload is of type Error, the promise will be treated as if rejected - the component will indicate failure
    rejectResolvedErrors: _propTypes2.default.bool,
    onPending: _propTypes2.default.func,
    onFinished: _propTypes2.default.func,
    onSuccess: _propTypes2.default.func,
    onSuccessEnd: _propTypes2.default.func,
    onError: _propTypes2.default.func,
    onErrorEnd: _propTypes2.default.func
};
AsyncState.defaultProps = {
    successClass: 'success',
    successProps: {},
    successDuration: 1000,
    errorClass: 'danger',
    errorProps: {},
    errorDuration: 1000,
    pendingProp: ['isPending', 'disabled'],
    pendingGroupProp: ['disabled'],
    trigger: 'onClick',
    rejectResolvedErrors: true
};
exports.default = AsyncState;