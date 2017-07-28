var restaurants = [
    {
        name: "The Purple Pig",
        coord: [41.89148,-87.624826]
    },
    {
        name: "Gyu-Kaku Japanese BBQ",
        coord: [41.892927, -87.622315]
    },
    {
        name: "Giordano's",
        coord:[41.896137,-87.625673]
    },
    {
        name: "Downtown Dogs",
        coord: [41.89715,-87.625855]
    },
    {
        name: "Tru",
        coord: [41.89461, -87.622920]
    },
    {
        name: "The Signature Room at the 95th®",
        coord: [41.899113,-87.62287]
    },
    {
        name: "Sprinkles Cupcakes",
        coord: [41.900303,-87.626299]
    }
];

var clientID = "DNDKALMOP1ZIYDHQAYHQK5YX0L4ARY3NHYFIGPUSDV45OVEH";
var clientSecret = "52RFOTUN5UNBXHOWWPCABS2D1HMT03MPKNU4CZEGBZPKMPI1";

var map;

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 41.897588, lng: -87.624146},
        zoom: 16,
        mapTypeControl: false
    });
    ko.applyBindings(new AppViewModel());
}

function errorHandler() {
    console.log("Something wrong with Google Map. Please try again later.");
}

var Restaurant = function (restaurant) {
    var self = this;

    this.name = restaurant.name;
    this.lat = restaurant.coord[0];
    this.lng = restaurant.coord[1];
    this.street = "";
    this.city = "";
    this.phone = "";

    this.visible = ko.observable(true);

    var fourSquarURL = "https://api.foursquare.com/v2/venues/search?v=20131016&ll=" + this.lat + "," + this.lng + "&query=" +
        this.name + "&intent=match" + "&client_id=" + clientID + "&client_secret=" + clientSecret;

    $.getJSON(fourSquarURL).done(function (restaurant) {
        var results = restaurant.response.venues[0];
        self.street = results.location.formattedAddress[0];
        self.city = results.location.formattedAddress[1];
        self.phone = results.contact.phone;
    });


    this.infoWindow = new google.maps.InfoWindow();
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(this.lat, this.lng),
        map: map,
        title: this.name
    });

    this.showMarker = ko.computed(function () {
        if (this.visible() == true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    this.marker.addListener('click', function () {

        self.infoWindow.setContent('<div class="info-window-content"><div class="title" style="text-align: center"><b>'
            + restaurant.name + "</b></div>" +
            '<div class="street" style="text-align: center">' + self.street + "</div>" +
            '<div class="city" style="text-align: center">' + self.city + "</div>" +
            '<div class="phone" style="text-align: center">' + self.phone + "</div></div>");

        self.infoWindow.open(map, this);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            self.marker.setAnimation(null);
        }, 1000);
    });

    this.bounce = function (restaurant) {
        google.maps.event.trigger(self.marker, 'click');
    };
}


function AppViewModel() {
    var self = this;

    this.query = ko.observable("");

    this.restaurantList = ko.observableArray([]);

    restaurants.forEach(function (restaurant) {
        self.restaurantList.push(new Restaurant(restaurant));
    });

    this.filteredList = ko.computed(function () {
        var query = self.query().toLowerCase();
        if (query == "") {
            self.restaurantList().forEach(function (restaurant) {
                restaurant.visible(true);
            });
            return self.restaurantList();
        } else {
            return ko.utils.arrayFilter(self.restaurantList(), function (restaurant) {
                var result = restaurant.name.toLowerCase().search(query) >= 0;
                restaurant.visible(result);
                return result;
            });
        }
    }, self);
}

