
$(window).load(function() {
	$("[name='adress']").attr('type', 'text');
	$("[name='adress']").attr("required", "true");
	$("[name='adress']").attr('id', 'suggestions');
	// $("[name='adress']").attr('data-msg', 'РџРѕР¶Р°Р»СѓР№СЃС‚Р°, СѓРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РїРѕР»РЅРѕСЃС‚СЊСЋ: СѓР»РёС†Р°, РґРѕРј, РєРІР°СЂС‚РёСЂР°');
$('<div class="t-text" name="dostavka_info" style="margin-top: 10px;font-style: italic;"><br></div>').insertAfter("[name='adress']");
// $("#suggestions").attr("title","РџРѕР¶Р°Р»СѓР№СЃС‚Р°, СѓРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РїРѕР»РЅРѕСЃС‚СЊСЋ: СѓР»РёС†Р°, РґРѕРј, РєРІР°СЂС‚РёСЂР°");
// $("#suggestions").attr("data-toggle","tooltip");
tippy('#suggestions', {theme: 'custom-dark', content: 'РџРѕР¶Р°Р»СѓР№СЃС‚Р°, СѓРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РїРѕР»РЅРѕСЃС‚СЊСЋ: СѓР»РёС†Р°, РґРѕРј, РєРІР°СЂС‚РёСЂР°',});
const tip_address = tippy(document.querySelector('#suggestions'));;
tip_address.setContent('РџРѕР¶Р°Р»СѓР№СЃС‚Р°, СѓРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РїРѕР»РЅРѕСЃС‚СЊСЋ: СѓР»РёС†Р°, РґРѕРј, РєРІР°СЂС‚РёСЂР°');
tip_address.setProps({
  arrow: true,
  animation: 'scale',
  zIndex: 99999999,
  theme: 'black',
});
console.log(tip_address);
	
ymaps.ready(init);
var myMap;
var deliveryZones;
var obj;
function init() {
	myMap = new ymaps.Map('map__0', {
			center: [104.275385, 52.277419],
			zoom: 12,
				autoFitToViewport: "always",
			controls: ['geolocationControl', 'searchControl']
		}),
		deliveryPoint = new ymaps.GeoObject({
			geometry: {type: 'Point'},
			properties: {iconCaption: 'Р’Р°С€ Р°РґСЂРµСЃ'}
		}, {
			preset: 'islands#blackDotIconWithCaption',
			draggable: true,
			iconCaptionMaxWidth: '215'
		}),
		searchControl = myMap.controls.get('searchControl');
	searchControl.options.set({noPlacemark: true, placeholderContent: 'Р’РІРµРґРёС‚Рµ Р°РґСЂРµСЃ РґРѕСЃС‚Р°РІРєРё'});
	myMap.geoObjects.add(deliveryPoint);

	function onZonesLoad(json) {
		// Р”РѕР±Р°РІР»СЏРµРј Р·РѕРЅС‹ РЅР° РєР°СЂС‚Сѓ.
		deliveryZones = ymaps.geoQuery(json).addToMap(myMap);
		// Р—Р°РґР°С‘Рј С†РІРµС‚ Рё РєРѕРЅС‚РµРЅС‚ Р±Р°Р»СѓРЅРѕРІ РїРѕР»РёРіРѕРЅРѕРІ.
		deliveryZones.each(function (obj) {
			obj.options.set({
				fillColor: obj.properties.get('fill'),
				fillOpacity: obj.properties.get('fill-opacity'),
				strokeColor: obj.properties.get('stroke'),
				strokeWidth: obj.properties.get('stroke-width'),
				strokeOpacity: obj.properties.get('stroke-opacity')
			});
			obj.properties.set('balloonContent', obj.properties.get('description'));
		});

		// РџСЂРѕРІРµСЂРёРј РїРѕРїР°РґР°РЅРёРµ СЂРµР·СѓР»СЊС‚Р°С‚Р° РїРѕРёСЃРєР° РІ РѕРґРЅСѓ РёР· Р·РѕРЅ РґРѕСЃС‚Р°РІРєРё.
		searchControl.events.add('resultshow', function (e) {
			console.log("РµРµРµ  Р±РѕР№");
			highlightResult(searchControl.getResultsArray()[e.get('index')]);
		});

		// РџСЂРѕРІРµСЂРёРј РїРѕРїР°РґР°РЅРёРµ РјРµС‚РєРё РіРµРѕР»РѕРєР°С†РёРё РІ РѕРґРЅСѓ РёР· Р·РѕРЅ РґРѕСЃС‚Р°РІРєРё.
		myMap.controls.get('geolocationControl').events.add('locationchange', function (e) {
			highlightResult(e.get('geoObjects').get(0));
		});

		// РџСЂРё РїРµСЂРµРјРµС‰РµРЅРёРё РјРµС‚РєРё СЃР±СЂР°СЃС‹РІР°РµРј РїРѕРґРїРёСЃСЊ, СЃРѕРґРµСЂР¶РёРјРѕРµ Р±Р°Р»СѓРЅР° Рё РїРµСЂРµРєСЂР°С€РёРІР°РµРј РјРµС‚РєСѓ.
		deliveryPoint.events.add('dragstart', function () {
			deliveryPoint.properties.set({iconCaption: '', balloonContent: ''});
			deliveryPoint.options.set('iconColor', 'black');
		});

		// РџРѕ РѕРєРѕРЅС‡Р°РЅРёРё РїРµСЂРµРјРµС‰РµРЅРёСЏ РјРµС‚РєРё РІС‹Р·С‹РІР°РµРј С„СѓРЅРєС†РёСЋ РІС‹РґРµР»РµРЅРёСЏ Р·РѕРЅС‹ РґРѕСЃС‚Р°РІРєРё.
		deliveryPoint.events.add('dragend', function () {
			highlightResult(deliveryPoint);
		});

		function highlightResult(obj) {
			console.log(obj);
			console.log(obj.geometry.getCoordinates());
			$("#suggestions").val($(".ymaps-2-1-77-searchbox-input__input").val());
			$("[name='dostavka_info'").html(polygon.properties.get('description'));

			// РЎРѕС…СЂР°РЅСЏРµРј РєРѕРѕСЂРґРёРЅР°С‚С‹ РїРµСЂРµРґР°РЅРЅРѕРіРѕ РѕР±СЉРµРєС‚Р°.
			var coords = obj.geometry.getCoordinates(),
			// РќР°С…РѕРґРёРј РїРѕР»РёРіРѕРЅ, РІ РєРѕС‚РѕСЂС‹Р№ РІС…РѕРґСЏС‚ РїРµСЂРµРґР°РЅРЅС‹Рµ РєРѕРѕСЂРґРёРЅР°С‚С‹.
				polygon = deliveryZones.searchContaining(coords).get(0);
				
			if (polygon) {
				console.log(polygon.properties.get('description'));
				// РЈРјРµРЅСЊС€Р°РµРј РїСЂРѕР·СЂР°С‡РЅРѕСЃС‚СЊ РІСЃРµС… РїРѕР»РёРіРѕРЅРѕРІ, РєСЂРѕРјРµ С‚РѕРіРѕ, РІ РєРѕС‚РѕСЂС‹Р№ РІС…РѕРґСЏС‚ РїРµСЂРµРґР°РЅРЅС‹Рµ РєРѕРѕСЂРґРёРЅР°С‚С‹.
				deliveryZones.setOptions('fillOpacity', 0.4);
				polygon.options.set('fillOpacity', 0.8);
				// РџРµСЂРµРјРµС‰Р°РµРј РјРµС‚РєСѓ СЃ РїРѕРґРїРёСЃСЊСЋ РІ РїРµСЂРµРґР°РЅРЅС‹Рµ РєРѕРѕСЂРґРёРЅР°С‚С‹ Рё РїРµСЂРµРєСЂР°С€РёРІР°РµРј РµС‘ РІ С†РІРµС‚ РїРѕР»РёРіРѕРЅР°.
				deliveryPoint.geometry.setCoordinates(coords);
				deliveryPoint.options.set('iconColor', polygon.properties.get('fill'));
				// Р—Р°РґР°РµРј РїРѕРґРїРёСЃСЊ РґР»СЏ РјРµС‚РєРё.
				if (typeof(obj.getThoroughfare) === 'function') {
					setData(obj);
				} else {
					// Р•СЃР»Рё РІС‹ РЅРµ С…РѕС‚РёС‚Рµ, С‡С‚РѕР±С‹ РїСЂРё РєР°Р¶РґРѕРј РїРµСЂРµРјРµС‰РµРЅРёРё РјРµС‚РєРё РѕС‚РїСЂР°РІР»СЏР»СЃСЏ Р·Р°РїСЂРѕСЃ Рє РіРµРѕРєРѕРґРµСЂСѓ,
					// Р·Р°РєРѕРјРјРµРЅС‚РёСЂСѓР№С‚Рµ РєРѕРґ РЅРёР¶Рµ.
					ymaps.geocode(coords, {results: 1}).then(function (res) {
						var obj = res.geoObjects.get(0);
						setData(obj);
					});
				}
			} else {
				// Р•СЃР»Рё РїРµСЂРµРґР°РЅРЅС‹Рµ РєРѕРѕСЂРґРёРЅР°С‚С‹ РЅРµ РїРѕРїР°РґР°СЋС‚ РІ РїРѕР»РёРіРѕРЅ, С‚Рѕ Р·Р°РґР°С‘Рј СЃС‚Р°РЅРґР°СЂС‚РЅСѓСЋ РїСЂРѕР·СЂР°С‡РЅРѕСЃС‚СЊ РїРѕР»РёРіРѕРЅРѕРІ.
				deliveryZones.setOptions('fillOpacity', 0.4);
				// РџРµСЂРµРјРµС‰Р°РµРј РјРµС‚РєСѓ РїРѕ РїРµСЂРµРґР°РЅРЅС‹Рј РєРѕРѕСЂРґРёРЅР°С‚Р°Рј.
				deliveryPoint.geometry.setCoordinates(coords);
				// Р—Р°РґР°С‘Рј РєРѕРЅС‚РµРЅС‚ Р±Р°Р»СѓРЅР° Рё РјРµС‚РєРё.
				deliveryPoint.properties.set({
					iconCaption: 'Р”РѕСЃС‚Р°РІРєР° С‚СЂР°РЅСЃРїРѕСЂС‚РЅРѕР№ РєРѕРјРїР°РЅРёРµР№',
					balloonContent: 'CРІСЏР¶РёС‚РµСЃСЊ СЃ РѕРїРµСЂР°С‚РѕСЂРѕРј',
					balloonContentHeader: ''
				});
				// РџРµСЂРµРєСЂР°С€РёРІР°РµРј РјРµС‚РєСѓ РІ С‡С‘СЂРЅС‹Р№ С†РІРµС‚.
				deliveryPoint.options.set('iconColor', 'black');
			}

			function setData(obj){
				var address = [obj.getThoroughfare(), obj.getPremiseNumber(), obj.getPremise()].join(' ');
				if (address.trim() === '') {
					address = obj.getAddressLine();
				}
				var price = polygon.properties.get('description');
				price = price.match(/<strong>(.+)<\/strong>/)[1];
				deliveryPoint.properties.set({
					iconCaption: address,
					balloonContent: address,
					balloonContentHeader: price
				});
			}
		}
		
		
		var sug;
		$("#suggestions").blur(function(){
			console.log(sug);
			
			try{
				if (!sug.data.house){
					console.log("РІС‹РІРѕР¶Сѓ С‚РёРї", tip_address);
					tip_address.show();
					
					// $("#suggestions").prop("title","РџРѕР¶Р°Р»СѓР№СЃС‚Р°, СѓРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РїРѕР»РЅРѕСЃС‚СЊСЋ: СѓР»РёС†Р°, РґРѕРј, РєРІР°СЂС‚РёСЂР°");
					// alert("РџРѕР¶Р°Р»СѓР№СЃС‚Р°, СѓРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РїРѕР»РЅРѕСЃС‚СЊСЋ: СѓР»РёС†Р°, РґРѕРј, РєРІР°СЂС‚РёСЂР°");
				}
			} catch(e) {
				console.log("error",e );
				// const tip_address = tippy(document.querySelector('#suggestions'));
				console.log("РІС‹РІРѕР¶Сѓ С‚РёРї", tip_address);
				tip_address.show();
				// $("#suggestions").prop("title","РџРѕР¶Р°Р»СѓР№СЃС‚Р°, СѓРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РїРѕР»РЅРѕСЃС‚СЊСЋ: СѓР»РёС†Р°, РґРѕРј, РєРІР°СЂС‚РёСЂР°");
				// alert("РџРѕР¶Р°Р»СѓР№СЃС‚Р°, СѓРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РїРѕР»РЅРѕСЃС‚СЊСЋ: СѓР»РёС†Р°, РґРѕРј, РєРІР°СЂС‚РёСЂР°");

			}
		});
		$("#suggestions").suggestions({
			token: "9e7eadbd4036f53c146fe2f69e3de359e78e9232",
			type: "ADDRESS",
			params: {
				triggerSelectOnBlur: true,
				triggerSelectOnEnter: true,
				locations_geo: [
					{
						lat: 52.277419,
						lon: 104.275385,
						radius_meters: 65000
					}
				]
			},
			// locations: [ "region", "РСЂРєСѓС‚СЃРєР°СЏ"],
			// restrict_value: true,
			/* Р’С‹Р·С‹РІР°РµС‚СЃСЏ, РєРѕРіРґР° РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РІС‹Р±РёСЂР°РµС‚ РѕРґРЅСѓ РёР· РїРѕРґСЃРєР°Р·РѕРє */
		onSelect: function(suggestion, changed) {
			console.log(suggestion);
			sug=suggestion;
			console.log(suggestion.data.house);
			if (!suggestion.data.house){
				console.log("РІС‹РІРѕР¶Сѓ С‚РёРї", tip_address);
				tip_address.show();
				
				// $("#suggestions").tooltip();
			//     alert("РџРѕР¶Р°Р»СѓР№СЃС‚Р°, СѓРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РїРѕР»РЅРѕСЃС‚СЊСЋ: СѓР»РёС†Р°, РґРѕРј, РєРІР°СЂС‚РёСЂР°");
			}
			console.log("РєРѕРѕСЂРґС‹ РёР· РґР°РґР°С‚Р°: ",[suggestion.data.geo_lat,suggestion.data.geo_lon]);
			console.log("РїРѕР»РёРіРѕРЅ: ",deliveryZones.searchContaining([suggestion.data.geo_lon, suggestion.data.geo_lat]).get(0));
			var coords = [suggestion.data.geo_lon, suggestion.data.geo_lat],
			// РќР°С…РѕРґРёРј РїРѕР»РёРіРѕРЅ, РІ РєРѕС‚РѕСЂС‹Р№ РІС…РѕРґСЏС‚ РїРµСЂРµРґР°РЅРЅС‹Рµ РєРѕРѕСЂРґРёРЅР°С‚С‹.
				polygon = deliveryZones.searchContaining(coords).get(0);
				
			if (polygon) {
				console.log(polygon.properties.get('description'));
				
				
				
				//!
				// $('<div class="t-text" name="dostavka_info"><br></div>').insertBefore("[data-input-lid='1606970309593'] > t-input-block");
				

				// $("[data-input-lid='1606970309593']").append('<div class="t-text" name="dostavka_info"><br></div>');
				$("[name='dostavka_info'").html(polygon.properties.get('description'));
				//!
				
				
				
				
				
				// РЈРјРµРЅСЊС€Р°РµРј РїСЂРѕР·СЂР°С‡РЅРѕСЃС‚СЊ РІСЃРµС… РїРѕР»РёРіРѕРЅРѕРІ, РєСЂРѕРјРµ С‚РѕРіРѕ, РІ РєРѕС‚РѕСЂС‹Р№ РІС…РѕРґСЏС‚ РїРµСЂРµРґР°РЅРЅС‹Рµ РєРѕРѕСЂРґРёРЅР°С‚С‹.
				deliveryZones.setOptions('fillOpacity', 0.4);
				polygon.options.set('fillOpacity', 0.8);
				// РџРµСЂРµРјРµС‰Р°РµРј РјРµС‚РєСѓ СЃ РїРѕРґРїРёСЃСЊСЋ РІ РїРµСЂРµРґР°РЅРЅС‹Рµ РєРѕРѕСЂРґРёРЅР°С‚С‹ Рё РїРµСЂРµРєСЂР°С€РёРІР°РµРј РµС‘ РІ С†РІРµС‚ РїРѕР»РёРіРѕРЅР°.
				deliveryPoint.geometry.setCoordinates(coords);
				deliveryPoint.options.set('iconColor', polygon.properties.get('fill'));
				// Р Р°Р·РјРµС‰Р°РµРј С‚РµРєСЃС‚ РІ РїРѕРёСЃРєРµ РєР°СЂС‚С‹ РёР· РёРЅРїСѓС‚Р° РІ РєРѕСЂР·РёРЅРµ
				$(".ymaps-2-1-77-searchbox-input__input").val($("#suggestions").val());
				// Р—Р°РґР°РµРј РїРѕРґРїРёСЃСЊ РґР»СЏ РјРµС‚РєРё.
				if (typeof(obj.getThoroughfare) === 'function') {
					setData(obj);
				} else {
					// Р•СЃР»Рё РІС‹ РЅРµ С…РѕС‚РёС‚Рµ, С‡С‚РѕР±С‹ РїСЂРё РєР°Р¶РґРѕРј РїРµСЂРµРјРµС‰РµРЅРёРё РјРµС‚РєРё РѕС‚РїСЂР°РІР»СЏР»СЃСЏ Р·Р°РїСЂРѕСЃ Рє РіРµРѕРєРѕРґРµСЂСѓ,
					// Р·Р°РєРѕРјРјРµРЅС‚РёСЂСѓР№С‚Рµ РєРѕРґ РЅРёР¶Рµ.
					ymaps.geocode(coords, {results: 1}).then(function (res) {
						var obj = res.geoObjects.get(0);
						setData(obj);
					});
				}
			} else {
				
				// $("#suggestions").prop("title","РџРѕР¶Р°Р»СѓР№СЃС‚Р°, СѓРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РїРѕР»РЅРѕСЃС‚СЊСЋ: СѓР»РёС†Р°, РґРѕРј, РєРІР°СЂС‚РёСЂР°");
				// $("#suggestions").tooltip();
				$("[name='dostavka_info'").html("Рљ СЃРѕР¶Р°Р»РµРЅРёСЋ, РІР°С€ Р°РґСЂРµСЃ РЅРµ РІС…РѕРґРёС‚ РІ Р·РѕРЅС‹ РЅР°С€РµР№ РґРѕСЃС‚Р°РІРєРё. РќРѕ, РјС‹ РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ С‡С‚Рѕ-РЅРёР±СѓРґСЊ РїСЂРёРґСѓРјР°РµРј! РџСЂРѕСЃС‚Рѕ РїРѕР·РІРѕРЅРёС‚Рµ РЅР°Рј РїРѕ С‚РµР» <a href='tel:+73952746486' style=''>746-486</a>");

			}
			// if (suggestion.data.house)
		},
		// onSelect: function(changed, suggestion) {
		//     console.log("РџСЂРѕРёР·РѕС€Р»Рё РёР·РјРµРЅРµРЅРёСЏ");
		//     if
			
		// },
		onSuggestionsFetch: function(suggestion){
			console.log("РїРѕРґСЃРєР°Р·РєРё Р·Р°РіСЂСѓР·РёР»РёСЃСЊ");
			console.log(suggestion);
			// setSuggestion(suggestion);
		},
		onSelectNothing: function(suggestion) {
			console.log("Р¤РѕРєСѓСЃ Р±РµР· РІС‹Р±СЂР°РЅРЅРѕР№ РїРѕРґСЃРєР°Р·РєРё");
			console.log(suggestion);
			
			
			try{
				if (!suggestion.data.house){
					console.log("РІС‹РІРѕР¶Сѓ С‚РёРї", tip_address);
					tip_address.show();
					
					// alert("РџРѕР¶Р°Р»СѓР№СЃС‚Р°, СѓРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РїРѕР»РЅРѕСЃС‚СЊСЋ: СѓР»РёС†Р°, РґРѕРј, РєРІР°СЂС‚РёСЂР°");
				}
			} catch(e) {
				console.log("error",e );
				console.log("РІС‹РІРѕР¶Сѓ С‚РёРї", tip_address);
				tip_address.show();
				// alert("РџРѕР¶Р°Р»СѓР№СЃС‚Р°, СѓРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РїРѕР»РЅРѕСЃС‚СЊСЋ: СѓР»РёС†Р°, РґРѕРј, РєРІР°СЂС‚РёСЂР°");

			}
			
			// alert("РџРѕР¶Р°Р»СѓР№СЃС‚Р°, СѓРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РїРѕР»РЅРѕСЃС‚СЊСЋ: СѓР»РёС†Р°, РґРѕРј, РєРІР°СЂС‚РёСЂР°");
		}
		});
		
	}
		
	// $.ajax({
	// 		url:'https://xn--c1abdm0av.xn--p1acf/d/%D0%94%D0%BE%D1%81%D1%82%D0%B0%D0%B2%D0%BA%D0%B0%20_%D0%93%D0%BE%D0%BD%D0%BA%D0%BE%D0%BD%D0%B3__18-12-2020_10-48-09.geojson',
	// //    url: 'https://sandbox.api.maps.yandex.net/examples/ru/2.1/delivery_zones/data.geojson',
	//     dataType: 'json',
	//     success: onZonesLoad
	// });
	

	$.getJSON('https://hitag.ru/files/hongkong/map-hongkong.json', function(data) {
	  console.log(data, obj);
	  obj=data;
	  // obj=jQuery.parseJSON(data);
	  onZonesLoad(obj);
	});
			//  alert( obj.name);
	/* $.getJSON(url, function (data) {
		alert(data.name);
		onZonesLoad(data);
	}); */
	/* var json = jQuery.parseJSON() */
	/* console.log(json) */
	/* onZonesLoad(json) */
}
});