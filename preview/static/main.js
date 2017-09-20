require.config({
	paths:
	{
		'vue':'/lib/vue@2.4.2/vue',
		'lodash':'/lib/lodash@4.16.0/lodash',
		'marked':'/lib/marked@0.3.6/marked',
		'highlight':'/lib/highlight.js@9.12.0/highlight.min',
		'jquery':'/lib/jquery@3.2.1/jquery.min',
		'less':'/lib/less@2.7.2/less.min',
	}
});

define(["vue","less","jquery","marked","highlight","modules/dataStructureParser"], (Vue,less, $, marked, highlight, DataStructureParser) =>
{
	(async () =>
	{
		const configrequest = await fetch('./patternlibraryconfig.json');
		let config = await configrequest.json();
		
		if(config.developmentenvironment && config.developmentenvironment.livereloadport)
		{
			$('<script src="//localhost:'+ config.developmentenvironment.livereloadport +'/livereload.js"></script>').appendTo('body');
		}
	})();

	var afterRender = (href) =>
	{
		$('pre code').each((i, $block) =>
		{
			highlight.highlightBlock($block);
		});

		let $livepreviewAreas = $('[data-livepreview]');
		$livepreviewAreas.each((i, previewarea) =>
		{
			let $previewarea =  $(previewarea);
			// console.log('previewarea',$previewarea)
			let $iframe = $('<iframe src="preview.html?id='+ i +'&path='+ encodeURIComponent(href.replace("#","")) +'"></iframe>');
			$previewarea.after($iframe);
			$previewarea.hide();
		});
		// console.log('afterRender livepreviewAreas', $livepreviewAreas)
		// console.log('afterRender href', href)
	};

	Vue.component('maincontent', {
		template: '#vuetemplate-maincontent',
		props: ['content']
	});

	Vue.component('navigation', {
		template: '#vuetemplate-navigation',
		props: ['navigation', 'sourceDirectory']
	});
	Vue.component('navigation-list', {
		template: '#vuetemplate-navigationlist',
		props: ['items', 'sourceDirectory', 'level'],
		filters:
		{
			// formatFilepathUrl:function(filepath,sourceDirectory)
			// {
			// 	let url = filepath.replace(sourceDirectory,"");
			// 	url = url.replace(".md","");
			// 	return "#" +url;
			// }
		},
		methods:
		{
			onNavigationClick:function(event)
			{
				let href = event.target.attributes.href.value;
				this.$root.loadPage(this,href);
			}
		}
	});

	var app = new Vue({
		el: '#davanmonet-app',
		data:
		{
			configLoaded:false,
			navigation:[],
			maincontent:
			{
				content:"<h1 class='preview-h1'>Welcome</h1><p class='preview-intro-p'>Use the navigation to see the content</p>"
			},
			projectConfig:{},
			indexStructure:{},
			pageLookup:{}
		},
		created: function ()
		{
			
			this.fetchData(this).then(() =>
			{
			});
		},
		methods:
		{
			loadPage:async function(_vue,href)
			{
				let _dataStructureParser = new DataStructureParser();
				let pagePath = href.replace("#","");
				let pagedata = await _dataStructureParser.getPage(pagePath);
				console.log('returned pagedata', pagedata)
				this.maincontent.content = pagedata;
				this.$nextTick(() =>
				{
					afterRender(href);
				});
				// let sourcepath = this.projectConfig.directories.src + href.replace("#","") + ".md";
				// fetch(sourcepath).then(res => res.text()).then(filecontent =>
				// {
				// 	//Clean filecontent, remove all content before the second "---"
				// 	var cleanedContent = filecontent.substring(filecontent.substring(3,filecontent.length).indexOf("---")+7,filecontent.length);
					
					

				// 	window["a"] = filecontent;
				// 	let contentInfo = this.pageLookup[sourcepath];
				// 	let compiledContent = marked(cleanedContent, { sanitize: false });
				// 	this.maincontent.content = compiledContent;
				// 	this.$nextTick(() =>
				// 	{
				// 		afterRender(href);
				// 	});
				// });
			},
			fetchData: async (_vue) =>
			{
				const configreq = await fetch('./patternlibraryconfig.json');
				const config = await configreq.json();
				_vue.projectConfig = config;
				
				const indexreq = await fetch(config.indexing.output);
				const indexStructure = await indexreq.json();
				_vue.indexStructure = indexStructure;

				let _dataStructureParser = new DataStructureParser();
				
				let navigation = await _dataStructureParser.getNavigation();
				_vue.navigation = navigation;
			
				_vue.parseHashAndNavigate();
				_vue.configLoaded = true;

			},
			parseHashAndNavigate:function()
			{
				const hash = window.location.hash;
				if(hash.indexOf("#/") !== -1)
				{
					this.loadPage(this, hash);
				}
			}
		}
	});
});