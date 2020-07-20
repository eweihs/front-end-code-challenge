// This is just a simple sample code to show you the usage of the api
// Feel free to rewrite and improve or delete and start from scratch

(function(){
	function processStory (event) {
		var story = JSON.parse(event.currentTarget.response);
		var list = document.querySelector('.list');
		var storyItem = document.createElement('li');
		storyItem.innerText = story.title;
		list.appendChild(storyItem);
	}
	
	function renderStory (storyId) {
		var getStory = new XMLHttpRequest();
		getStory.addEventListener('load', processStory);
		getStory.open('GET', 'https://hacker-news.firebaseio.com/v0/item/' + storyId + '.json');
		getStory.send();
	}

	function processList (event) {
		var storiesList = JSON.parse(event.currentTarget.response);
		Array.map(storiesList, renderStory);
	}

	var getStoriesListRequest = new XMLHttpRequest();
	getStoriesListRequest.addEventListener('load', processList);
	getStoriesListRequest.open('GET', 'https://hacker-news.firebaseio.com/v0/topstories.json');
	getStoriesListRequest.send();
})();
