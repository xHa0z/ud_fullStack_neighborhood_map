var restaurants = [
    {
        name: "The Purple Pig",
        coord: {lat: 41.89148,lng: -87.624826}
    },
    {
        name: "Gyu-Kaku Japanese BBQ",
        coord: {lat: 41.892927, lng: -87.622315}
    },
    {
        name: "Giordano's",
        coord:{lat: 41.896137,lng: -87.625673}
    },
    {
        name: "Downtown Dogs",
        coord: {lat: 41.89715,lng: -87.625855}
    },
    {
        name: "Tru",
        coord: {lat: 41.89461, lng: -87.622920}
    },
    {
        name: "The Signature Room at the 95th®",
        coord: {lat: 41.899113,lng: -87.62287}
    },
    {
        name: "Sprinkles Cupcakes",
        coord: {lat: 41.900303,lng: -87.626299}
    }
];
var markers = [];

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

    var infoWindow = new google.maps.InfoWindow();
    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FFFF24');
    for (var i = 0; i < restaurants.length; i++) {

        var pos = restaurants[i].coord;
        var title = restaurants[i].name;
        var marker = new google.maps.Marker({
            map: map,
            position: pos,
            title: title,
            animaation: google.maps.Animation.DROP,
            icon: defaultIcon
        });
        markers.push({'marker': marker, 'name' : marker.title});
        marker.addListener('click', function() {
            populateInfoWindow(this, infoWindow);
        });
        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });

    }

    ko.applyBindings(new AppViewModel());
}

function errorHandler() {
    console.log("Something wrong with Google Map. Please try again later.");
}

function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    var fsURL = "https://api.foursquare.com/v2/venues/search?v=20131016&ll=" + marker.getPosition().lat() + "," +
        marker.getPosition().lng() + "&query=" +
        marker.title + "&intent=match" + "&client_id=" + clientID + "&client_secret=" + clientSecret;


    $.getJSON(fsURL).done(function(data){
        var result = data.response.venues[0];
        infowindow.setContent('<div class="info-window-content"><div class="title" style="text-align: center"><b>' +
            marker.title + "</b></div>" +
            '<div class="street" style="text-align: center">' + result.location.formattedAddress[0] + "</div>" +
            '<div class="city" style="text-align: center">' + result.location.formattedAddress[1] + "</div>" +
            '<div class="phone" style="text-align: center">' + result.contact.phone + "</div></div>")
    });
    infowindow.marker = marker;
    infowindow.open(map, marker);
    infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
        infowindow.setContent("");
    });

}

function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
    return markerImage;
}

function setVisible(marker, isVisible) {
    if (isVisible) {
        marker.setMap(map);
    } else {
        marker.setMap(null);
    }
}

function AppViewModel() {
    var self = this;

    self.rstList = ko.observableArray([]);
    self.query = ko.observable("")

    restaurants.forEach(function(rst) {
       self.rstList.push(new Restaurant(rst))
    });

    this.filteredList = ko.computed(function () {
        var query = self.query().toLowerCase();
        if (query === "") {
            console.log(111);
            for (var i = 0; i < markers.length; i++) {
                setVisible(markers[i].marker, true);
            }
            return  self.rstList();
        } else {
            console.log(222);
            for (i = 0; i < markers.length; i++) {
                var name = markers[i].name;
                console.log(name);
                var result = name.toLowerCase().search(query) >= 0;
                setVisible(markers[i].marker, result);
                console.log(result)
            }
            return  self.rstList()
        }
    }, self);




}

var Restaurant = function(data) {
    this.name = ko.observable(data.name);
}
