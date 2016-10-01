// Uses Tree lookup API to traverse the Tree in Bread First manner

var Steps = Steps || {};

Steps = (function () {
    var newNodes = [];
    var lookup = new TreeLookup();
    var root = '/';
    var lookNode = 1;
    
    var visit = [];
    
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
            var error = document.createElement('div');
            error.classList.add('error-class');
            var parent = document.getElementsByClassName('inner')[0];
            error.innerHTML = 'Enter only numbers';
            parent.appendChild(error);
            cache['text'].value = '';
            setTimeout(function () {
                parent.removeChild(error);
            }, 2000);
        },
        _validateInput: function (value) {
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
            if(fn._validateInput(lookNode)) {
                fn._showError();
                return;
            }
            
            var promise = new Promise(fn._traverseTree);
            promise.then(function (val) {
               console.log('Fulfilled', root); 
                result.innerHTML = 'The number: <span class="bold_class">' + lookNode + '</span> that you have searched is found at: <span class="success_message bold_class">' + root + '</span>';
            }).catch(function(reason) {
                console.log('Not found');  
                result.innerHTML = 'The number: ' + lookNode + ' that you have searched is not found';
            });
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
