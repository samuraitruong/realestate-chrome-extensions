function reverseAddress() {

    chrome.storage.sync.get({
        apiKey: '',
        preferAddress: '',
        replaceMap: false
    }, function (items) {

        if (!items.apiKey) {
            alert('Google map API key not set');
            return;
        }


        const apiKey = items.apiKey;
        const youraddress = items.preferAddress;
        const address = document.querySelector('.property-info-address').textContent;
        if (!address) {
            console.log("No Address found, skiping...");
            return;
        }

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(youraddress)}&destination=${encodeURIComponent(address)}&key=${apiKey}&mode=driving`
        const cacheKey = '__map_' + address;

        const updateAddress = (data) => {
            const { howFar, points } = data;
            console.log(howFar, points)
            const div = document.createElement('div');
            div.textContent = howFar;
            div.style.color = 'green';
            div.style.fontWeight = 'bold'
            localStorage.setItem('__map_' + address, JSON.stringify(data))

            const icon = `icon:https://s1.rui.au.reastatic.net/rui-static/img/mapping/map-pin-v2.png|${address}`
            document.querySelector('.property-info__property-attributes').appendChild(div)
            if (items.replaceMap) {
                let intervalId = undefined;

                const mapUrl = `https://maps.google.com/maps/api/staticmap?size=640x350&maptype=roadmap&format=png&scale=1&markers=${icon}&key=${apiKey}&center=${youraddress}&path=enc:${points}`
                intervalId = setInterval(() => {
                    if (document.querySelector('.static-map__img')) {
                        document.querySelector('.static-map__img').style.backgroundImage = `url('${mapUrl}')`;
                        document.querySelector('.map').style.height = "350px";
                        clearInterval(intervalId)
                    }
                }, 500);
            }
        }

        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
            console.log("cachedData", JSON.parse(cachedData))
            updateAddress(JSON.parse(cachedData))
        } else {
            fetch('https://cors-anywhere.herokuapp.com/' + url, { mode: 'cors' })
                .then((response) => {
                    console.log(response)
                    return response.json()
                })
                .then((data) => {
                    console.log(data)
                    const howFar = `${data.routes[0].legs[0].distance.text} ( ${data.routes[0].legs[0].duration.text})`
                    const points = data.routes[0].overview_polyline.points;

                    updateAddress({ howFar, points })
                });
        }
    });

}
reverseAddress()

