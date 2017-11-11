/* Populate dive info and graphs on click */
var diveSelectedClass = 'dive-selected';

document.querySelectorAll('.dive-summary').forEach(i=>{
	i.addEventListener('click', e=>{
		var diveId = i.getAttribute('dive-id');

		document.querySelectorAll('.dive-summary').forEach(el=>{
			el.classList.remove(diveSelectedClass);
		});
		i.classList.add(diveSelectedClass);
		console.log(diveId);
		console.log('Yes');

		get_dive(diveId);
	});
});

function get_dive(diveId) {
	var xhr = new XMLHttpRequest();
  fetch('dive/' + diveId)
    .then((response) => {
      return response.text();
    })
    .then((text) => {
      diveReceived(text);
    });
}

function diveReceived(responseText) {
	var diveRecords = JSON.parse(responseText);
	updateDiveGraph(diveRecords);
}

var options = {
  height: '700px',
  axisX: {
    labelInterpolationFnc: function(value, index) {
      return index % 5 == 0 ? index : null;
    }
  },
  axisY: {
    labelInterpolationFnc: function(value) {
      return -value;
    }
}};

var responsiveOptions = [
  ['screen and (min-width: 641px) and (max-width: 1024px)', {
    showPoint: false,
  }],
  ['screen and (max-width: 640px)', {
    showLine: false,
  }]
];

function updateDiveGraph(diveRecords) {

  let serie = diveRecords.map(record => {
    return {x: record.timestamp, y: -record.depth}
  });

  console.log(serie);

	var data = {
		series: [serie]
	}

	new Chartist.Line('.ct-chart', data, options, responsiveOptions);
}

//Initial set to first dive
get_dive(0);
