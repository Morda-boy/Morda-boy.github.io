$(window).load(function() {
	$("[name='adress']").attr('type', 'text');
	$("[name='adress']").attr("required", "true");
	$("[name='adress']").attr('id', 'suggestions');

	$('<div class="t-text" name="dostavka_info" style="margin-top: 10px;font-style: italic;"><br></div>').insertAfter("[name='adress']");

	tippy('#suggestions', {theme: 'custom-dark', content: 'Пожалуйста, укажите адрес полностью: улица, дом, квартира',});
	const tip_address = tippy(document.querySelector('#suggestions'));
	tip_address.setContent('Пожалуйста, укажите адрес полностью: улица, дом, квартира');
	tip_address.setProps({
		arrow: true,
		animation: 'scale',
		zIndex: 99999999,
		theme: 'black',
	});

	ymaps.ready(init);
	var myMap;
	var deliveryZones;
	var obj;

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

	function checkZoneGeoJSON(lon, lat, callback) {
		fetch('https://morda-boy.github.io/gk138-04-04-2026.geojson')
			.then(function(r) { return r.json(); })
			.then(function(data) {
				var zone = null;
				for (var i = 0; i < data.features.length; i++) {
					var f = data.features[i];
					var polys = f.geometry.type === 'Polygon'
						? [f.geometry.coordinates[0]]
						: f.geometry.coordinates.map(function(p) { return p[0]; });
					for (var k = 0; k < polys.length; k++) {
						if (pointInPoly([lon, lat], polys[k])) {
							zone = f.properties.description;
							break;
						}
					}
					if (zone) break;
				}
				callback(zone ? zone.trim().toLowerCase() : null);
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
			deliveryZones = ymaps.geoQuery(json).addToMap(myMap);
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

			// При смене варианта доставки — разблокируем кнопку
			$('input[name="deliveryvar"]').on('change', function() {
				if ($(this).val() !== 'Доставка (до подъезда)') {
					$('button[type="submit"]').prop('disabled', false).css('opacity', '1');
					$("[name='dostavka_info']").html('');
				}
			});

			searchControl.events.add('resultshow', function (e) {
				highlightResult(searchControl.getResultsArray()[e.get('index')]);
			});

			myMap.controls.get('geolocationControl').events.add('locationchange', function (e) {
				highlightResult(e.get('geoObjects').get(0));
			});

			deliveryPoint.events.add('dragstart', function () {
				deliveryPoint.properties.set({iconCaption: '', balloonContent: ''});
				deliveryPoint.options.set('iconColor', 'black');
			});

			deliveryPoint.events.add('dragend', function () {
				highlightResult(deliveryPoint);
			});

			function highlightResult(obj) {
				var coords = obj.geometry.getCoordinates();
				var polygon = deliveryZones.searchContaining(coords).get(0);

				if (polygon) {
					deliveryZones.setOptions('fillOpacity', 0.4);
					polygon.options.set('fillOpacity', 0.8);
					deliveryPoint.geometry.setCoordinates(coords);
					deliveryPoint.options.set('iconColor', polygon.properties.get('fill'));
					if (typeof(obj.getThoroughfare) === 'function') {
						setData(obj);
					} else {
						ymaps.geocode(coords, {results: 1}).then(function (res) {
							var obj = res.geoObjects.get(0);
							setData(obj);
						});
					}
				} else {
					deliveryZones.setOptions('fillOpacity', 0.4);
					deliveryPoint.geometry.setCoordinates(coords);
					deliveryPoint.properties.set({
						iconCaption: 'Доставка транспортной компанией',
						balloonContent: 'Cвяжитесь с оператором',
						balloonContentHeader: ''
					});
					deliveryPoint.options.set('iconColor', 'black');
				}

				function setData(obj) {
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
			$("#suggestions").blur(function() {
				try {
					if (!sug.data.house) {
						tip_address.show();
					}
				} catch(e) {
					tip_address.show();
				}
			});

			$("#suggestions").suggestions({
				token: "9e7eadbd4036f53c146fe2f69e3de359e78e9232",
				type: "ADDRESS",
				params: {
					triggerSelectOnBlur: true,
					triggerSelectOnEnter: true,
					locations_geo: [{
						lat: 52.277419,
						lon: 104.275385,
						radius_meters: 65000
					}]
				},
				onSelect: function(suggestion, changed) {
					sug = suggestion;

					if (!suggestion.data.house) {
						tip_address.show();
					}

					var lon = parseFloat(suggestion.data.geo_lon);
					var lat = parseFloat(suggestion.data.geo_lat);

					// Блокируем кнопку пока проверяем зону
					$('button[type="submit"]').prop('disabled', true).css('opacity', '0.5');
					$("[name='dostavka_info']").html('Проверяем адрес...');

					checkZoneGeoJSON(lon, lat, function(zone) {

						if (zone === 'сорокин') {
							$("[name='dostavka_info']").html('<span style="color:green">✓ Адрес входит в зону доставки</span>');
							$('button[type="submit"]').prop('disabled', false).css('opacity', '1');

						} else if (zone === 'гусев') {
							$("[name='dostavka_info']").html(
								'<span style="color:red">Ваш адрес обслуживает другой филиал. ' +
								'Оформите заказ на <a href="https://hongkong38.ru" target="_blank">hongkong38.ru</a></span>'
							);
							$('button[type="submit"]').prop('disabled', true).css('opacity', '0.5');

						} else {
							$("[name='dostavka_info']").html(
								'<span style="color:red">Ваш адрес не входит в зону доставки. ' +
								'Позвоните нам: <a href="tel:+73952959797">95-97-97</a></span>'
							);
							$('button[type="submit"]').prop('disabled', true).css('opacity', '0.5');
						}
					});

					// Обновляем карту
					var coords = [lon, lat];
					var polygon = deliveryZones.searchContaining(coords).get(0);
					if (polygon) {
						deliveryZones.setOptions('fillOpacity', 0.4);
						polygon.options.set('fillOpacity', 0.8);
						deliveryPoint.geometry.setCoordinates(coords);
						deliveryPoint.options.set('iconColor', polygon.properties.get('fill'));
						$(".ymaps-2-1-77-searchbox-input__input").val($("#suggestions").val());
					} else {
						$("[name='dostavka_info']").html(
							'<span style="color:red">Ваш адрес не входит в зону доставки. ' +
							'Позвоните нам: <a href="tel:+73952959797">95-97-97</a></span>'
						);
					}
				},
				onSuggestionsFetch: function(suggestion) {
					console.log("подсказки загрузились");
				},
				onSelectNothing: function(suggestion) {
					try {
						if (!suggestion.data.house) {
							tip_address.show();
						}
					} catch(e) {
						tip_address.show();
					}
				}
			});
		}

		$.getJSON('https://morda-boy.github.io/map-hongkong-2025-02.geojson', function(data) {
			console.log(data, obj);
			obj = data;
			onZonesLoad(obj);
		});
	}
});
