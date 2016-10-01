// Uses Tree lookup API to traverse the Tree in Bread First manner

var Steps = Steps || {};
var Storage = Storage || {};

Storage = (function () {
    var fn = {
        _setItem: function (key, value, isCloud) {
            if(window.localStorage) {
                window.localStorage.setItem(key, value);
            }
            else {
                //document.cookie = key + '=' + value;
            }
        },
        _getItem: function (key, isCloud) {
            if(window.localStorage) {
                return window.localStorage.getItem(key);
            }
            else {
                //document.cookie = key + '=' + value;
            }
        },
        _removeItem: function (key) {
            if(window.localStorage) {
                window.localStorage.removeItem(key);
            }
            else {
                //document.cookie = key + '=' + value;
            }
        }
    };
    var api = {
        setItem: function (key, value) {
            return fn._setItem.apply(this, arguments);
        },
        getItem: function (key) {
            return fn._getItem.apply(this, arguments);
        },
        removeItem: function(key) {
            return fn._removeItem.apply(this, arguments);
        }
    };
    return api;
})();


Steps = (function () {
    var newNodes = [];
    var lookup = new TreeLookup();
    var root = '/';
    var lookNode = 1;
    
    var visit = [];
    
    var recents = {};
    var shownRecents = [], recentCounter = 0;
    
    var result, showResult;
    
    var cache = {
        'button': '',
        'text': ''
    };
    
    var fn = {
        _init: function () {
            lookup = new TreeLookup();
            fn._handleEvents();
        },
        _handleEvents: function () {
            if(!cache['button'])
                cache['button'] = document.getElementById('searchBtn');
            document.getElementById('search').focus();
            cache['button'].addEventListener('click', fn._handleClick);
        },
        _showError: function () {
            var parent = document.getElementsByClassName('error-area')[0];
            parent.innerHTML = '';
            var error = document.createElement('div');
            error.classList.add('error-class');
            
            error.innerHTML = 'Enter only numbers';
            parent.appendChild(error);
            cache['text'].value = '';
            setTimeout(function () {
                parent.innerHTML = '';
            }, 2000);
        },
        _validateInput: function (value) {
            if(value === '') return true;
            return isNaN(value);
        },
        _handleClick: function () {
            visit = [];
            showResult = '';
            if(!result) {
                result = document.getElementById('result');
            }
            if(!cache['text'])
                cache['text'] = document.getElementById('search');
            lookNode = cache['text'].value;
            lookNode = lookNode.trim();
            if(fn._validateInput(lookNode)) {
                fn._showError();
                return;
            }
            var hasSearched = recents[lookNode];
            if(hasSearched) {
                fn._displayMessage(hasSearched !== null, hasSearched);
            }
            else {
                var promise = new Promise(fn._traverseTree);
                console.log ('Using promise');
                promise.then(function (val) {
                    recents[lookNode] = root;
                    fn._displayMessage(true, root);
                }).catch(function(reason) {
                    recents[lookNode] = null;  
                    fn._displayMessage(false, null);
                });
            }        
        },
        _updateRecents: function () {
            var recentElem = document.createElement('span');
            var parent = document.getElementById('recent');
            var keys = Object.keys(recents);
            var len = keys.length;
            parent.innerHTML = '';
            for(var i = 0; i < len; ++ i) {
                (function (i) {
                    recentElem = document.createElement('span');
                    recentElem.classList.add('recent-item');
                    recentElem.innerText = keys[i] + ' -> ' + recents[keys[i]];
                    parent.appendChild(recentElem);
                })(i);
            }
        },
        _displayMessage: function (isFound, position) {
            result.innerHTML = 'The number: ' + lookNode + ' that you have searched is ' + (isFound ? 'found at: <span class="success_message bold_class">' + position + '</span>' : 'not found');
            fn._updateRecents();
        },
        _traverseTree: function (resolve, reject) {
            root = '/';
            lookup.getChildrenAsCallback(root, function recur(err, nodesFromCb) {
                newNodes = nodesFromCb;
                if(newNodes.indexOf(lookNode) !== -1) resolve(root); 
                else {
                    function recursion(node) {
                        (function (node) {
                            root = (node[0] !== '/') ? '/' + node : node;
                            lookup  .getChildrenAsPromise(root)
                                    .then(function (nodesFromPromise) {
                                        visit.push(root);
                                        if(nodesFromPromise.length === 0 && newNodes.length === 0) {
                                            reject();
                                        }
                                        else if(nodesFromPromise.indexOf(lookNode) !== -1) {
                                            resolve(root);
                                        }
                                        else {
                                            if(nodesFromPromise.length > 0) {
                                                nodesFromPromise.forEach(function(n) {
                                                    if(newNodes.indexOf(n) === -1) {
                                                        newNodes.push(root + '/' + n);    
                                                    }
                                                });
                                            }
                                            if(newNodes.length > 0) {
                                                recursion(newNodes.shift());
                                            }
                                        }
                                    });
                        })(node);
                    }
                    recursion(newNodes.shift());
                }
            });
        }
    };
    var api = {
        init: function () {
            return fn._init.apply(this, arguments);
        }
    };
    return api;
})();

window.onload = function() {
    Steps.init();
}
