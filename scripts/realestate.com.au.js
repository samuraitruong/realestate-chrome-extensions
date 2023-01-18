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
        const address = document.querySelector('.property-info-address')?.textContent;
        console.log("address", address)
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
            fetch('https://proxy.cors.sh/' + url, { mode: 'cors' })
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

function updateListPage() {
    const list = document.querySelectorAll('.tiered-results-container article');
    const processItem = (el) => {
        console.log(el.getAttribute('aria-label'))

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
            const address = el.getAttribute('aria-label')
            console.log("listing address", address)
            if (!address) {
                console.log("No Address found, skiping...");
                return;
            }

            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(youraddress)}&destination=${encodeURIComponent(address)}&key=${apiKey}&mode=driving`
            const cacheKey = '__map_' + address;

            const icon = `icon:https://s1.rui.au.reastatic.net/rui-static/img/mapping/map-pin-v2.png|${address}`
            const mapUrl = `https://maps.google.com/maps/api/staticmap?size=640x480&maptype=roadmap&format=png&scale=1&markers=${encodeURIComponent(icon)}&key=${apiKey}&center=${encodeURIComponent(youraddress)}`

            const updateAddress = (data) => {
                const { howFar, points } = data;
                console.log(howFar, points)
                const div = document.createElement('div');
                const originalImage = el.getElementsByClassName('property-image__img')[0].previousSibling?.getAttribute("srcset");
                
                div.onmouseover = () => {

                    el.getElementsByClassName('property-image__img')[0].setAttribute('src', mapUrl)
                    el.getElementsByClassName('property-image__img')[0].previousSibling.setAttribute('srcset', mapUrl);
                    el.getElementsByClassName('property-image__img')[0].previousSibling.setAttribute('type', "image/png")
                }

                div.onmouseout = () => {

                    el.getElementsByClassName('property-image__img')[0].setAttribute('src', originalImage)
                    el.getElementsByClassName('property-image__img')[0].previousSibling.setAttribute('srcset', originalImage);
                    el.getElementsByClassName('property-image__img')[0].previousSibling.setAttribute('type', "image/webp")
                }

                div.className = "piped-content__inner";


                //property-image__img
                const div1 = document.createElement('span')
                div.appendChild(div1)
                div1.textContent = howFar;
                div1.style.color = 'green';
                div1.style.fontWeight = 'bold'
                localStorage.setItem('__map_' + address, JSON.stringify(data))

                el.getElementsByClassName('piped-content__outer')[0].appendChild(div)
            }

            const cachedData = localStorage.getItem(cacheKey);

            if (cachedData) {
                console.log("cachedData", JSON.parse(cachedData))
                updateAddress(JSON.parse(cachedData))
            } else {
                fetch('https://proxy.cors.sh/' + url, {
                    mode: 'cors', headers: {
                        'x-cors-api-key': 'temp_8bcdb3cf39d7228b0953f9b7c44f0207'
                    }
                })
                    .then((response) => {
                        //console.log(response)
                        return response.json()
                    })
                    .then((data) => {
                        //console.log(data)
                        const howFar = `${data.routes[0].legs[0].distance.text} ( ${data.routes[0].legs[0].duration.text})`
                        const points = data.routes[0].overview_polyline.points;

                        updateAddress({ howFar, points })
                    });
            }
        });


    }
    for (const result of list) {
        try {
            processItem(result)
        } catch (err) { }
    }
}

updateListPage();
reverseAddress()

