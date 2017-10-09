require.config({
	paths:
	{
		'vue':'/lib/vue@2.4.2/vue',
		'lodash':'/lib/lodash@4.16.0/lodash',
		'marked':'/lib/marked@0.3.6/marked',
		'highlight':'/lib/highlight.js@9.12.0/highlight.min',
		'jquery':'/lib/jquery@3.2.1/jquery.min',
		'less':'/lib/less@2.7.2/less.min',
		'es6-promise':'/lib/es6-promise@4.1.1/es6-promise.auto.min',
		'http-vue-loader':'/lib/http-vue-loader@1.3.3/httpVueLoader'
	}
});

define([
	"vue",
	"less",
	"jquery",
	"marked",
	"highlight",
	"modules/pageLoader",
	"modules/configLoader",
	"es6-promise",
	"http-vue-loader"], (
		Vue, 
		less, 
		$, 
		marked, 
		highlight, 
		PageLoader,
		ConfigLoader,
		es6promise,
		httpVueLoader_) =>
{
	window["highlight"] = highlight;
	var afterRender = (href) =>
	{
		// $('pre code').each((i, $block) =>
		// {
		// 	highlight.highlightBlock($block);
		// });

		// let $livepreviewAreas = $('[data-livepreview]');
		// $livepreviewAreas.each((i, previewarea) =>
		// {
		// 	let $previewarea =  $(previewarea);
		// 	let $iframe = $('<iframe src="preview.html?id='+ i +'&path='+ encodeURIComponent(href.replace("#","")) +'"></iframe>');
		// 	$previewarea.after($iframe);
		// 	$previewarea.hide();
		// });
	};
	Vue.use(httpVueLoader);

	Vue.component('maincontent', {
		components:
		[
			"url:/vuecomponents/component/ComponentShowcase.vue"
		],
		template: '#vuetemplate-maincontent',
		props: ['content','cssBreakpoints']
	});

	Vue.component('navigation', {
		template: '#vuetemplate-navigation',
		props: ['navigation', 'sourceDirectory']
	});
	Vue.component('previewcss', {
		template: '#vuetemplate-previewcss',
		props: ['csstargets']
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
		components:
		{
			'component-showcase-render':httpVueLoader('/components/ComponentShowcaseRender.vue')
		},
		data:
		{
			configLoaded:false,
			navigation:[],
			maincontent:
			{
				title:"Welcome",
				content:"<p>Use the navigation to see the content</p>"
			},
			projectConfig:{},
			indexStructure:{},
			pageLookup:{},
			csstargets:[]
		},
		created: function ()
		{
			this.init(this);
		},
		methods:
		{
			init: async function(_vue)
			{
				await ConfigLoader.LoadConfig();
				
				_vue.projectConfig = ConfigLoader.ProjectConfig;

				if(_vue.projectConfig.developmentenvironment
					&& _vue.projectConfig.developmentenvironment.livereloadport)
				{
					$('<script src="//localhost:'+ _vue.projectConfig.developmentenvironment.livereloadport +'/livereload.js"></script>')
						.appendTo('body');
				}

				this.fetchData(this).then(() =>
				{
				});
			},

			loadPage: async function(_vue,href)
			{
				let _pageLoader = new PageLoader();
				let pagePath = href.replace("#","");
				let pagedata = await _pageLoader.getPage(pagePath);
				
				// console.log('returned pagedata', pagedata);

				this.maincontent = pagedata;
				this.$nextTick(() =>
				{
					afterRender(href);
				});	
			},

			fetchData: async function(_vue)
			{	
				const indexreq = await fetch(_vue.projectConfig.indexing.output);
				const indexStructure = await indexreq.json();
				_vue.indexStructure = indexStructure;

				let _pageLoader = new PageLoader();
				
				let navigation = await _pageLoader.getNavigation();
				_vue.navigation = navigation;
				
				let csstargets = await _pageLoader.getCssTargets();
				_vue.csstargets = csstargets;

				_vue.parseHashAndNavigate();
				_vue.configLoaded = true;
			},

			parseHashAndNavigate: function()
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