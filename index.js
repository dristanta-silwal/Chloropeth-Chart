let countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
let educationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'

let countyData
let educationData

let canvas = d3.select('#canvas')
let tooltip = d3.select('#tooltip')

var svg = d3.select('svg');

var x = d3.scaleLinear().domain([2.6, 75.1]).rangeRound([600, 860]);

var color = d3
    .scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
    .range(d3.schemeReds[9]);

var g = svg
    .append('g')
    .attr('class', 'key')
    .attr('id', 'legend')
    .attr('transform', 'translate(0,40)');

g.selectAll('rect')
    .data(
        color.range().map(function (d) {
            d = color.invertExtent(d);
            if (d[0] === null) {
                d[0] = x.domain()[0];
            }
            if (d[1] === null) {
                d[1] = x.domain()[1];
            }
            return d;
        })
    )
    .enter()
    .append('rect')
    .attr('height', 8)
    .attr('x', function (d) {
        return x(d[0]);
    })
    .attr('width', function (d) {
        return d[0] && d[1] ? x(d[1]) - x(d[0]) : x(null);
    })
    .attr('fill', function (d) {
        return color(d[0]);
    });

g.append('text')
    .attr('class', 'caption')
    .attr('x', x.range()[0])
    .attr('y', -6)
    .attr('fill', '#000')
    .attr('text-anchor', 'start')
    .attr('font-weight', 'bold');

g.call(
    d3
        .axisBottom(x)
        .tickSize(13)
        .tickFormat(function (x) {
            return Math.round(x) + '%';
        })
        .tickValues(color.domain())
)
    .select('.domain')
    .remove();

let drawMap = () => {
    canvas.selectAll('path')
        .data(countyData)
        .enter()
        .append('path')
        .attr('d', d3.geoPath())
        .attr('class', 'county')
        .attr('fill', (countyDataItem) => {
            let id = countyDataItem['id']
            let county = educationData.find((item) => {
                return item['fips'] === id
            })
            let percent = county['bachelorsOrHigher']
            for (let i = 1; i <= 10; i++) {
                if (percent <= i * 10) {
                    return 'rgba(255,0,0,0.' + (i + 3) + ')'
                }
            }
        })
        .attr('data-fips', (countyDataItem) => {
            return countyDataItem['id']
        })
        .attr('data-education', (countyDataItem) => {
            let id = countyDataItem['id']
            let county = educationData.find((item) => {
                return item['fips'] === id
            })
            let percent = county['bachelorsOrHigher']
            return percent
        })
        .on('mouseover', function (event, d) {
            tooltip.style('opacity', 0.9);
            tooltip
                .html(function () {
                    var result = educationData.filter(function (obj) {
                        return obj.fips === d.id;
                    });
                    if (result[0]) {
                        return (
                            result[0]['area_name'] +
                            ', ' +
                            result[0]['state'] +
                            ': ' +
                            result[0].bachelorsOrHigher +
                            '%'
                        );
                    }
                    // could not find a matching fips id in the data
                    return 0;
                })
                .attr('data-education', function () {
                    var result = educationData.filter(function (obj) {
                        return obj.fips === d.id;
                    });
                    if (result[0]) {
                        return result[0].bachelorsOrHigher;
                    }
                    // could not find a matching fips id in the data
                    return 0;
                })
                .style('left', event.pageX + 10 + 'px')
                .style('top', event.pageY - 28 + 'px');
        })
        .on('mouseout', function () {
            tooltip.style('opacity', 0);
        });
}

d3.json(countyURL)
    .then((data, error) => {
        if (error) {
            console.log(log);
        } else {
            countyData = topojson.feature(data, data.objects.counties).features
            // console.log(countyData);

            d3.json(educationURL)
                .then((data2, error) => {
                    if (error) {
                        console.log(log);
                    } else {
                        educationData = data2
                        // console.log(educationData);
                        drawMap()
                    }
                })
        }
    })