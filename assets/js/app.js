const DOMSTRING = (function() {
    let submitTweetForm = document.querySelector('#form');
    let tweet = document.querySelector('#tweet');
    let tweetList = document.querySelector('#tweet-list');
    let removeTweet = document.querySelector('remove-tweet');

    return {
        submitTweetForm: submitTweetForm,
        tweetList: tweetList,
        removeButton: removeTweet,
        tweetInputArea: tweet
    };
})();

// ** model ** care about data
const MODEL = (function(DOM) {

    //** localStorage 儲存與刪除 **
    let storage = (function() {

        let set = function(key) {

            let storageKey = key,
                data,
                id;

            if (JSON.parse(localStorage.getItem(storageKey)) === null) {
                data = [];
                id = 0;
            } else {
                data = JSON.parse(localStorage.getItem(storageKey));
                id = data[data.length - 1].id;
            }

            let save = function(value) {
                if (value.length === 0) {
                    DOM.tweetInputArea.blur();
                    setTimeout(() => {
                        DOM.tweetInputArea.focus();
                    }, 100);

                    return;
                }

                id++;

                let dataObject = {
                    id: id,
                    value: value
                };
                data.push(dataObject);
                localStorage.setItem(storageKey, JSON.stringify(data));
                DOM.tweetInputArea.focus();
            };

            let remove = function(targetID) {
                data.forEach((element, index) => {
                    let comparedId = element.id;
                    if (comparedId === targetID) {
                        data.splice(index, 1);
                    }
                })
                localStorage.setItem(storageKey, JSON.stringify(data));
                if (JSON.parse(localStorage.getItem(storageKey)).length === 0) {
                    localStorage.clear();
                }
            };

            return {
                save: save,
                remove: remove
            };
        };

        return {
            set: set
        }
    })();

    return {
        storage: storage
    };
})(DOMSTRING);

// ** View ** care about the DOM
const VIEW = (function(DOM) {

    let display = (function(target) {

        let tweetTemplate = function(msg, id) {
            return `<li>${msg} <a class="remove-tweet" data-id="${id}">x</a></li>`;
        };

        let repaint = function() {
            target.innerHTML = '';
            if (JSON.parse(localStorage.getItem('tweet')) !== null) {
                JSON.parse(localStorage.getItem('tweet')).forEach((tweetInfo) => {
                    let id = tweetInfo.id;
                    let msg = tweetInfo.value;
                    target.insertAdjacentHTML('beforeend', tweetTemplate(msg, id));
                });
            }
        };

        let reset = function() {
            target.value = '';
        };

        return {
            repaint: repaint,
            reset: reset
        };
    });

    return {
        display: display
    }
})(DOMSTRING);

// ** Controller **
const CONTROLLER = (function(DOM, VIEW, MODEL) {

    let tweetListAppendingMessage = function(messageValue) {
        MODEL.storage.set('tweet').save(messageValue);
        VIEW.display(DOM.tweetList).repaint();
        VIEW.display(DOM.tweetInputArea).reset();
    };

    let tweetListRemovingMessage = function(id) {
        MODEL.storage.set('tweet').remove(id);
        VIEW.display(DOM.tweetList).repaint();
    };

    let tweetListDisplayingWithLatestVersion = function() {
        DOM.tweetInputArea.setAttribute('placeholder', 'please enter your message!');
        VIEW.display(DOM.tweetList).repaint();
    }

    let initTweet = function() {

        document.addEventListener('DOMContentLoaded', function(event) {
            tweetListDisplayingWithLatestVersion();
        });

        DOM.submitTweetForm.addEventListener('submit', (event) => {
            tweetListAppendingMessage(DOM.tweetInputArea.value);
        });

        DOM.tweetInputArea.addEventListener('keydown', (event) => {
            if (event.code === 'Enter') {
                tweetListAppendingMessage(DOM.tweetInputArea.value);
                event.preventDefault();
            }

        });

        DOM.tweetList.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-tweet')) {
                let id = parseInt(event.target.getAttribute('data-id'), 10);
                tweetListRemovingMessage(id);
            }
        });
    };

    return {
        initTweet: initTweet
    }
})(DOMSTRING, VIEW, MODEL);

CONTROLLER.initTweet();