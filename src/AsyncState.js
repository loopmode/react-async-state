import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const groups = {
    default: []
};

export default class AsyncState extends Component {
    static propTypes = {
        successDuration: PropTypes.number,
        errorDuration: PropTypes.number,
        successClass: PropTypes.string,
        errorClass: PropTypes.string,
        children: PropTypes.element,
        initialPending: PropTypes.bool,
        pendingProp: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        pendingGroupProp: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        group: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.bool]),
        trigger: PropTypes.string,
        // if true, and a promise is resolved, but its payload is of type Error, the promise will be treated as if rejected
        rejectResolvedErrors: PropTypes.string
    };
    static defaultProps = {
        successClass: 'success',
        successDuration: 1000,
        errorClass: 'danger',
        errorDuration: 1000,
        pendingProp: ['isPending', 'disabled'],
        pendingGroupProp: ['disabled'],
        trigger: 'onClick',
        rejectResolvedErrors: true
    };
    get child() {
        return React.Children.only(this.props.children);
    }
    state = {
        isPending: this.initialPending,
        isPendingGroup: false,
        hintSuccess: false,
        hintError: false,
    };
    componentDidMount() {
        this._isMounted = true;
        if (this.props.group) {
            this.registerGroup(this.props.group);
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.group !== this.props.group) {
            this.unregisterGroup(this.props.group);
            this.registerGroup(nextProps.group);
        }
    }
    componentWillUnmount() {
        this._isMounted = false;
        this.clearTimeouts();
        if (this.props.group) {
            this.unregisterGroup(this.props.group);
        }
    }
    setStateSafely(nextState) {
        this._isMounted && this.setState(nextState);
    }
    render() {
        return React.cloneElement(this.child, this.createChildProps(this.child));
    }
    createChildProps() {
        const {successClass, errorClass, trigger} = this.props;
        const {...childProps} = this.child.props;
        if (childProps[trigger]) {
            childProps[trigger] = this.handleTrigger;
        }
        const applyPendingProp = (props, value) => {
            if (typeof value === 'string') {
                props[value] = true;
            }
            else {
                value.forEach(prop => props[prop] = true);
            }
        };
        if (this.state.isPending) {
            applyPendingProp(childProps, this.props.pendingProp);
        }
        if (this.state.isPendingGroup) {
            applyPendingProp(childProps, this.props.pendingGroupProp);
        }
        childProps.className = cx(
            childProps.className,
            {[successClass]: this.state.hintSuccess},
            {[errorClass]: this.state.hintError},
        );
        return childProps;
    }
    getPromise(value) {
        if (value && typeof value.then === 'function') {
            return value;
        }
        return undefined;
    }
    handleTrigger = (e) => {
        const {trigger} = this.props;
        const callback = this.child.props[trigger];
        const callbackResult = typeof callback === 'function' && callback(e);
        const promise = this.getPromise(callbackResult);
        // console.log('handleTrigger', {callback, callbackResult, promise});
        if (promise) {

            const handleResult = () => { 
                this.setStateSafely({
                    isPending: false,
                    hintSuccess: true,
                    hintError: false
                });
                this.setGroupPending(this.props.group, false);
                this._successTimeout = window.setTimeout(() => {
                    this.setStateSafely({hintSuccess: false})
                }, this.props.successDuration);
            }
            const handleError = () => { 
                this.setStateSafely({
                    isPending: false,
                    hintError: true,
                    hintSuccess: false
                });
                this.setGroupPending(this.props.group, false);
                this._errorTimeout = window.setTimeout(() => {
                    this.setStateSafely({hintError: false})
                }, this.props.errorDuration);
            }  

            this.clearTimeouts();
            this.setState({isPending: true});
            if (this.props.group) {
                this.setGroupPending(this.props.group, true);
            }
            promise.catch(handleError);
            promise.then((result) => {
                if (this.props.rejectResolvedErrors && result instanceof Error) {
                    return handleError(result)
                }
                return handleResult(result);
                
            });

        }
        return callbackResult;
    }


    //-----------------------------------
    //
    // GROUP HANDLING
    //
    //-----------------------------------


    clearTimeouts = () => {
        window.clearTimeout(this._successTimeout);
        window.clearTimeout(this._errorTimeout);
    }
    getGroupName(group) {
        switch (typeof group) {
            case 'boolean': return 'default';
            case 'string': return group;
            case 'function': return this.getGroupName(group(this));
        }
    }
    registerGroup(group) {
        if (group) {
            const groupName = this.getGroupName(group);
            groups[groupName] = [...(groups[groupName] || []), this];
        }
    }
    unregisterGroup(group) {
        if (group) {
            const groupName = this.getGroupName(group);
            groups[groupName] = (groups[groupName] || []).filter(component => component !== this);
        }
    }
    setGroupPending(group, isPendingGroup) {
        const groupName = this.getGroupName(group);
        const groupMembers = groups[groupName];
        // console.info('setGroupPending', {groupName, groupMembers});
        if (groupMembers) {
            groupMembers
                .filter(component => component !== this)
                .forEach(component => {
                    // console.info('setGroupPending', {component, isPendingGroup});
                    component.setStateSafely({isPendingGroup});
                })
            ;
        }
    }
}
