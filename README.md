# async-state

A wrapper component that indicates the pending state of a child callback.

It works as a plain wrapper around anything with a click handler that returns a promise.
While the promise is pending, the wrapped components receives one or more flags to indicate that (default: `isPending` and `disabled`).

<img src="https://github.com/loopmode/react-async-state/raw/master/react-async-state-success.gif" />

<img src="https://github.com/loopmode/react-async-state/raw/master/react-async-state-error.gif" />


What's needed on your side is
- the click callback returns a promise
- the wrapped component understands how to show pending state (e.g. show a spinner when it receives the prop `showSpinner`)
- the wrapped component understands how to show success or error state based on CSS classes (e.g `success`: show in green, `danger`: show in red)

```javascript
render() {
    return (
        <div>
            ...
            <AsyncState>
                <button onClick={this.refresh}>refresh</button>
            </AsyncState>
            ...
        </div>
    );
}
async refresh() {
    // have the handle function be async, or return a promise
    // return new Promise((resolve) => setTimeout(resolve, 1000))
}
    
```

## Why

Why would you need this? Because you don't want to manually keep pending states all over the place.

Now you can write:

```javascript
import React, { Component } from 'react';
import AsyncState from '@loopmode/react-async-state';

export class MyComponent extends Component {
    render() {
        return (
            <div>
                <AsyncState>
                    <button onClick={this.load}>load</button>
                </AsyncState>
                <AsyncState>
                    <button onClick={this.save}>save</button>
                </AsyncState>
            </div>
        );
    }
    load = () => someApi.load();
    save = () => someApi.save();
}

```

Compare that to manual handling of pending state:

```javascript
import React, { Component } from 'react';

export class MyComponent extends Component {
    state = {
        isLoading: false,
        showLoadSuccess: false,
        showLoadError: false,
        isSaving: false,
        showSaveSuccess: false,
        showSaveError: false,
    }
    componentDidMount() {
        this._isMounted = true;
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    render() {
        return (
            <div>
                <button onClick={this.load}>load</button>
                <button onClick={this.save}>save</button>
            </div>
        );
    }
    load = () => {
        this.setState({
            isLoading: true
            showLoadSuccess: false,
            showLoadError: false
        });
        someApi.load()
            .then(() => {
                this._isMounted && this.setState({
                    isLoading: false,
                    showLoadSuccess: true
                });
                setTimeout(() => {
                    this._isMounted && this.setState({
                        showLoadSuccess: false,
                    })
                }, 1000)
            })
            .catch(error => {
                this._isMounted && this.setState({
                    isLoading: false,
                    showLoadError: true
                });
                setTimeout(() => {
                    this._isMounted && this.setState({
                        showLoadError: false,
                    })
                }, 1000)
            })
    }
    save = () => {
        this.setState({
            isSaving: true
            showSaveSuccess: false,
            showSaveError: false
        });
        someApi.save()
            .then(() => {
                this._isMounted && this.setState({
                    isSaving: false,
                    showSaveSuccess: true
                });
                setTimeout(() => {
                    this._isMounted && this.setState({
                        showSaveSuccess: false,
                    })
                }, 1000)
            })
            .catch(error => {
                this._isMounted && this.setState({
                    isSaving: false,
                    showSaveError: true
                });
                setTimeout(() => {
                    this._isMounted && this.setState({
                        showSaveError: false,
                    })
                }, 1000)
            })
    }
}

```



## TODO

- proper documentation
- add tests
- add examples