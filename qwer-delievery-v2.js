
$(window).load(function() {
	$("[name='adress']").attr('type', 'text');
	$("[name='adress']").attr("required", "true");
	$("[name='adress']").attr('id', 'suggestions');
	// $("[name='adress']").attr('data-msg', 'Пожалуйста, укажите адрес полностью: улица, дом, квартира');
    console.log('hello');

$('<div class="t-text" name="dostavka_info" style="margin-top: 10px;font-style: italic;"><br></div>').insertAfter("[name='adress']");

$('<div class="t-text" name="dostavka_summ" style="margin-top: 10px;font-style: italic;"><br></div>').insertAfter("[name='dostavka_info']");



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
			$("[name='dostavka_info'").html(polygon.properties.get('description'));

			// Сохраняем координаты переданного объекта.
			var coords = obj.geometry.getCoordinates(),
			// Находим полигон, в который входят переданные координаты.
				polygon = deliveryZones.searchContaining(coords).get(0);
				
			if (polygon) {
				console.log(polygon.properties.get('description'));
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
					// Если вы не хотите, чтобы при каждом перемещении метки отправлялся запрос к геокодеру,
					// закомментируйте код ниже.
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
					
					// $("#suggestions").prop("title","Пожалуйста, укажите адрес полностью: улица, дом, квартира");
					// alert("Пожалуйста, укажите адрес полностью: улица, дом, квартира");
				}
			} catch(e) {
				console.log("error",e );
				// const tip_address = tippy(document.querySelector('#suggestions'));
				console.log("вывожу тип", tip_address);
				tip_address.show();
				// $("#suggestions").prop("title","Пожалуйста, укажите адрес полностью: улица, дом, квартира");
				// alert("Пожалуйста, укажите адрес полностью: улица, дом, квартира");

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
			// locations: [ "region", "Иркутская"],
			// restrict_value: true,
			/* Вызывается, когда пользователь выбирает одну из подсказок */
		onSelect: function(suggestion, changed) {
			console.log(suggestion);
			sug=suggestion;
			console.log(suggestion.data.house);
			if (!suggestion.data.house){
				console.log("вывожу тип", tip_address);
				tip_address.show();
				
				// $("#suggestions").tooltip();
			//     alert("Пожалуйста, укажите адрес полностью: улица, дом, квартира");
			}
			console.log("коорды из дадата: ",[suggestion.data.geo_lat,suggestion.data.geo_lon]);
			console.log("полигон: ",deliveryZones.searchContaining([suggestion.data.geo_lon, suggestion.data.geo_lat]).get(0));
			var coords = [suggestion.data.geo_lon, suggestion.data.geo_lat],
			// Находим полигон, в который входят переданные координаты.
				polygon = deliveryZones.searchContaining(coords).get(0);
				
			if (polygon) {
				console.log(polygon.properties.get('description'));
             
             //Вычленяем сумму бесплатно доставки

                var sumDelive = polygon.properties.get('description')
			    console.log(sumDelive);
				var numEl22 = parseInt(sumDelive.match(/\d+/))
				console.log(numEl22);
                var summcart = +tcart.prodamount;
                console.log(summcart);
				//Расчитываем сумму сколько докупить до бесплатной доставки


				//!
				// $('<div class="t-text" name="dostavka_info"><br></div>').insertBefore("[data-input-lid='1606970309593'] > t-input-block");
				

				// $("[data-input-lid='1606970309593']").append('<div class="t-text" name="dostavka_info"><br></div>');
				$("[name='dostavka_info'").html(polygon.properties.get('description'));
                
				if (summcart < numEl22) {
					var sumDokup = numEl22-summcart;

				$("[name='dostavka_summ'").html(sumDokup);
				};
//Пробуем скрыть
//				$(".t-radio_delivery:eq(1)").parent('.t-radio__control').hide();

//Пробуем изменить доставку
(function () {
	console.log('++++');

    //Название скидки в системе
    let dnDelivery = 'Самовывоз 10%';
    //Название доставки в корзине
    let cartNameDelivery = 'Самовывоз';
        //Подпись для подсказки в корзине
    let discountHint = 'Скидка за самовывоз 10%';
    let discount = 0;


	//Главная функция: проверяет, выбран ли нужный способ доставки.

    let pickupOn = false;
    let firstOpen = true;
    
    function checkDelivery(){
        
        let deliveryName = document.querySelector('input.t-radio_delivery:checked');
		console.log(deliveryName);

        if(deliveryName==null) {
            deliveryName = 0;
        }else{
            deliveryName = deliveryName.value;
            deliveryName = deliveryName.trim()
        };
        
        if( deliveryName==cartNameDelivery  ){
            
            setTimeout(function() {
                let descr = document.querySelector('.t706__cartwin-discounts__description li');
                if(descr!=null){
                  descr.innerText = discountHint;
                };
            }, 500)
    
            if(!pickupOn){
                activePickup();
                pickupOn = true;
            };
            
        }else{
    
            if(pickupOn || firstOpen){
                unactivePickup();
                pickupOn = false;
                firstOpen = false;
            };
              
        };
    };

   
})();

				//! deliev_gk38
				
				
				
				
				
				// Уменьшаем прозрачность всех полигонов, кроме того, в который входят переданные координаты.
				deliveryZones.setOptions('fillOpacity', 0.4);
				polygon.options.set('fillOpacity', 0.8);
				// Перемещаем метку с подписью в переданные координаты и перекрашиваем её в цвет полигона.
				deliveryPoint.geometry.setCoordinates(coords);
				deliveryPoint.options.set('iconColor', polygon.properties.get('fill'));
				// Размещаем текст в поиске карты из инпута в корзине
				$(".ymaps-2-1-77-searchbox-input__input").val($("#suggestions").val());
				// Задаем подпись для метки.
				if (typeof(obj.getThoroughfare) === 'function') {
					setData(obj);
				} else {
					// Если вы не хотите, чтобы при каждом перемещении метки отправлялся запрос к геокодеру,
					// закомментируйте код ниже.
					ymaps.geocode(coords, {results: 1}).then(function (res) {
						var obj = res.geoObjects.get(0);
						setData(obj);
					});
				}
			} else {
				
				// $("#suggestions").prop("title","Пожалуйста, укажите адрес полностью: улица, дом, квартира");
				// $("#suggestions").tooltip();
				$("[name='dostavka_info'").html("К сожалению, ваш адрес не входит в зоны нашей доставки. Но, мы обязательно что-нибудь придумаем! Просто позвоните нам по тел <a href='tel:+73952746486' style=''>746-486</a>");

			}
			// if (suggestion.data.house)
		},
		// onSelect: function(changed, suggestion) {
		//     console.log("Произошли изменения");
		//     if
			
		// },
		onSuggestionsFetch: function(suggestion){
			console.log("подсказки загрузились");
			console.log(suggestion);
			// setSuggestion(suggestion);
		},
		onSelectNothing: function(suggestion) {
			console.log("Фокус без выбранной подсказки");
			console.log(suggestion);
			
			
			try{
				if (!suggestion.data.house){
					console.log("вывожу тип", tip_address);
					tip_address.show();
					
					// alert("Пожалуйста, укажите адрес полностью: улица, дом, квартира");
				}
			} catch(e) {
				console.log("error",e );
				console.log("вывожу тип", tip_address);
				tip_address.show();
				// alert("Пожалуйста, укажите адрес полностью: улица, дом, квартира");

			}
			
			// alert("Пожалуйста, укажите адрес полностью: улица, дом, квартира");
		}
		});
		
	}
		
	// $.ajax({
	// 		url:'https://xn--c1abdm0av.xn--p1acf/d/%D0%94%D0%BE%D1%81%D1%82%D0%B0%D0%B2%D0%BA%D0%B0%20_%D0%93%D0%BE%D0%BD%D0%BA%D0%BE%D0%BD%D0%B3__18-12-2020_10-48-09.geojson',
	// //    url: 'https://sandbox.api.maps.yandex.net/examples/ru/2.1/delivery_zones/data.geojson',
	//     dataType: 'json',
	//     success: onZonesLoad
	// });
	

	$.getJSON('https://morda-boy.github.io/map-hongkong-2025-01.geojson', function(data) {
		
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