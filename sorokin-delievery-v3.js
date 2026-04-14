$(window).load(function() {
	$("[name='adress']").attr('type', 'text');
	$("[name='adress']").attr("required", "true");
	$("[name='adress']").attr('id', 'suggestions');
	// $("[name='adress']").attr('data-msg', 'Пожалуйста, укажите адрес полностью: улица, дом, квартира');
$('<div class="t-text" name="dostavka_info" style="margin-top: 10px;font-style: italic;"><br></div>').insertAfter("[name='adress']");
// $("#suggestions").attr("title","Пожалуйста, укажите адрес полностью: улица, дом, квартира");
// $("#suggestions").attr("data-toggle","tooltip");
tippy('#suggestions', {theme: 'custom-dark', content: 'Пожалуйста, укажите адрес полностью: улица, дом, квартира',});
const tip_address = tippy(document.querySelector('#suggestions'));;
tip_address.setContent('Пожалуйста, укажите адрес полностью: улица, дом, квартира');
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

	// *** НОВОЕ: проверка попадания точки в полигон ***
	function pointInPoly(point, polygon) {
		var x = point[0], y = point[1], inside = false;
		for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			var xi = polygon[i][0], yi = polygon[i][1];
			var xj = polygon[j][0], yj = polygon[j][1];
			var intersect = ((yi > y) !== (yj > y)) &&
							(x < (xj - xi) * (y - yi) / (yj - yi) + xi);
			if (intersect) inside = !inside;
		}
		return inside;
	}

	// *** НОВОЕ: проверка попадания в любую зону из GeoJSON ***
	function isInAnyZone(lon, lat, callback) {
		fetch('https://morda-boy.github.io/gk138-04-04-2026.geojson')
			.then(function(r) { return r.json(); })
			.then(function(data) {
				var found = false;
				for (var i = 0; i < data.features.length; i++) {
					var f = data.features[i];
					var polys = f.geometry.type === 'Polygon'
						? [f.geometry.coordinates[0]]
						: f.geometry.coordinates.map(function(p) { return p[0]; });
					for (var k = 0; k < polys.length; k++) {
						if (pointInPoly([lon, lat], polys[k])) {
							found = true;
							break;
						}
					}
					if (found) break;
				}
				callback(found);
			});
	}

function init() {
	myMap = new ymaps.Map('map__0', {
			center: [104.275385, 52.277419],
			zoom: 12,
				autoFitToViewport: "always",
			controls: ['geolocationControl', 'searchControl']
		}),
		deliveryPoint = new ymaps.GeoObject({
			geometry: {type: 'Point'},
			properties: {iconCaption: 'Ваш адрес'}
		}, {
			preset: 'islands#blackDotIconWithCaption',
			draggable: true,
			iconCaptionMaxWidth: '215'
		}),
		searchControl = myMap.controls.get('searchControl');
	searchControl.options.set({noPlacemark: true, placeholderContent: 'Введите адрес доставки'});
	myMap.geoObjects.add(deliveryPoint);

	function onZonesLoad(json) {
		// Добавляем зоны на карту.
		deliveryZones = ymaps.geoQuery(json).addToMap(myMap);
		// Задаём цвет и контент балунов полигонов.
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

		// *** НОВОЕ: при смене варианта доставки — разблокируем кнопку ***
		$('input[name="deliveryvar"]').on('change', function() {
			if ($(this).val() !== 'Доставка (до подъезда)') {
				$('.t-submit').prop('disabled', false).css('opacity', '1').css('pointer-events', 'auto');
				$("[name='dostavka_info']").html('');
			}
		});

		// Проверим попадание результата поиска в одну из зон доставки.
		searchControl.events.add('resultshow', function (e) {
			console.log("еее  бой");
			highlightResult(searchControl.getResultsArray()[e.get('index')]);
		});

		// Проверим попадание метки геолокации в одну из зон доставки.
		myMap.controls.get('geolocationControl').events.add('locationchange', function (e) {
			highlightResult(e.get('geoObjects').get(0));
		});

		// При перемещении метки сбрасываем подпись, содержимое балуна и перекрашиваем метку.
		deliveryPoint.events.add('dragstart', function () {
			deliveryPoint.properties.set({iconCaption: '', balloonContent: ''});
			deliveryPoint.options.set('iconColor', 'black');
		});

		// По окончании перемещения метки вызываем функцию выделения зоны доставки.
		deliveryPoint.events.add('dragend', function () {
			highlightResult(deliveryPoint);
		});

		function highlightResult(obj) {
			console.log(obj);
			console.log(obj.geometry.getCoordinates());
			$("#suggestions").val($(".ymaps-2-1-77-searchbox-input__input").val());

			// Сохраняем координаты переданного объекта.
			var coords = obj.geometry.getCoordinates(),
			// Находим полигон, в который входят переданные координаты.
				polygon = deliveryZones.searchContaining(coords).get(0);

			if (polygon) {
				console.log(polygon.properties.get('description'));
				$("[name='dostavka_info'").html(polygon.properties.get('description'));
				// Уменьшаем прозрачность всех полигонов, кроме того, в который входят переданные координаты.
				deliveryZones.setOptions('fillOpacity', 0.4);
				polygon.options.set('fillOpacity', 0.8);
				// Перемещаем метку с подписью в переданные координаты и перекрашиваем её в цвет полигона.
				deliveryPoint.geometry.setCoordinates(coords);
				deliveryPoint.options.set('iconColor', polygon.properties.get('fill'));
				// Задаем подпись для метки.
				if (typeof(obj.getThoroughfare) === 'function') {
					setData(obj);
				} else {
					ymaps.geocode(coords, {results: 1}).then(function (res) {
						var obj = res.geoObjects.get(0);
						setData(obj);
					});
				}
			} else {
				// Если переданные координаты не попадают в полигон, то задаём стандартную прозрачность полигонов.
				deliveryZones.setOptions('fillOpacity', 0.4);
				// Перемещаем метку по переданным координатам.
				deliveryPoint.geometry.setCoordinates(coords);
				// Задаём контент балуна и метки.
				deliveryPoint.properties.set({
					iconCaption: 'Доставка транспортной компанией',
					balloonContent: 'Cвяжитесь с оператором',
					balloonContentHeader: ''
				});
				// Перекрашиваем метку в чёрный цвет.
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
					console.log("вывожу тип", tip_address);
					tip_address.show();
				}
			} catch(e) {
				console.log("error",e );
				console.log("вывожу тип", tip_address);
				tip_address.show();
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
		onSelect: function(suggestion, changed) {
			console.log(suggestion);
			sug=suggestion;
			console.log(suggestion.data.house);
			if (!suggestion.data.house){
				console.log("вывожу тип", tip_address);
				tip_address.show();
			}
			console.log("коорды из дадата: ",[suggestion.data.geo_lat,suggestion.data.geo_lon]);
			console.log("полигон: ",deliveryZones.searchContaining([suggestion.data.geo_lon, suggestion.data.geo_lat]).get(0));
			var coords = [suggestion.data.geo_lon, suggestion.data.geo_lat],
				polygon = deliveryZones.searchContaining(coords).get(0);
				
			if (polygon) {
				console.log(polygon.properties.get('description'));
				$("[name='dostavka_info'").html(polygon.properties.get('description'));
				deliveryZones.setOptions('fillOpacity', 0.4);
				polygon.options.set('fillOpacity', 0.8);
				deliveryPoint.geometry.setCoordinates(coords);
				deliveryPoint.options.set('iconColor', polygon.properties.get('fill'));
				$(".ymaps-2-1-77-searchbox-input__input").val($("#suggestions").val());
				if (typeof(obj.getThoroughfare) === 'function') {
					setData(obj);
				} else {
					ymaps.geocode(coords, {results: 1}).then(function (res) {
						var obj = res.geoObjects.get(0);
						setData(obj);
					});
				}
			} else {
				$("[name='dostavka_info'").html("К сожалению, ваш адрес не входит в зоны нашей доставки. Но, мы обязательно что-нибудь придумаем! Просто позвоните нам по тел <a href='tel:+73952746486' style=''>95-97-97</a>");
			}

			// *** НОВОЕ: дополнительно проверяем по нашему GeoJSON и блокируем кнопку ***
			var lon = parseFloat(suggestion.data.geo_lon);
			var lat = parseFloat(suggestion.data.geo_lat);
			$('.t-submit').prop('disabled', true).css('opacity', '0.5').css('pointer-events', 'none');

			isInAnyZone(lon, lat, function(inZone) {
				if (inZone) {
					$('.t-submit').prop('disabled', false).css('opacity', '1').css('pointer-events', 'auto');
				} else {
					$("[name='dostavka_info']").html(
						'<span style="color:red">Ваш адрес не входит в зону доставки. ' +
						'Позвоните нам: <a href="tel:+73952959797">95-97-97</a></span>'
					);
					$('.t-submit').prop('disabled', true).css('opacity', '0.5').css('pointer-events', 'none');
				}
			});
		},
		onSuggestionsFetch: function(suggestion){
			console.log("подсказки загрузились");
			console.log(suggestion);
		},
		onSelectNothing: function(suggestion) {
			console.log("Фокус без выбранной подсказки");
			console.log(suggestion);
			
			try{
				if (!suggestion.data.house){
					console.log("вывожу тип", tip_address);
					tip_address.show();
				}
			} catch(e) {
				console.log("error",e );
				console.log("вывожу тип", tip_address);
				tip_address.show();
			}
		}
		});
		
	}
		
	$.getJSON('https://morda-boy.github.io/gk-delievery-sorokin-04-2026.geojson', function(data) {
		console.log(data, obj);
		obj=data;
		onZonesLoad(obj);
	});
}
});
