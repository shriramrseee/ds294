import {AfterContentInit, Component, OnInit} from '@angular/core';
import * as d3 from "d3";
import {BasicService} from "../services/basic.service";
import {yago} from "../models/yago.model";
import {isNullOrUndefined} from "util";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterContentInit, OnInit {
  title = 'kg-viz';
  data = [];
  k = 10;
  width = 1920;
  height = 1500;
  vertex = '';
  zoom = 400;
  simulation = null;
  links = null;
  nodes = null;
  link = null;
  linktext = null;
  node = null;
  svg = null;

  constructor(public basicService: BasicService) {
  }

  ngAfterContentInit() {
    d3.select("p").style("color", "red");
    this.svg = d3.select("svg");
  }

  ngOnInit() {
    this.basicService.getLimitedRows(this.k).subscribe(res => {
      for (let i of <Array<any>> res) {
        this.data.push(new yago(i));
      }
      console.log(this.data);
    })
  }

  searchVertex() {
    this.basicService.getVertex((this.vertex)).subscribe(res => {
      this.data = [];
      this.nodes = [];
      this.links = [];
      let temp = new Map();
      for (let i of <Array<any>> res) {
        this.data.push(new yago(i));
      }
      for (let i of this.data) {
        if (isNullOrUndefined(i.value)) {
          temp[i.subject] = 1;
          temp[i.object] = 1;
          this.links.push(Object.create({"source": i.subject, "target": i.object, "label": i.predicate}));
        }
      }
      for (let i in temp) {
        this.nodes.push(Object.create({"id": i}));
      }
      console.log(this.data);
      console.log(this.nodes);
      console.log(this.links);
      this.drawGraph();
    })
  }

  changeZoom(newVal) {
    console.log(newVal);
    this.drawGraph();
  }

  drawGraph() {
    this.svg.selectAll("*").remove();

    let force = this.simulation = d3.forceSimulation(this.nodes)
      .force("link", d3.forceLink(this.links).id(d => d.id).distance(this.zoom).strength(1))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));

    let link = this.svg.selectAll("line")
      .data(this.links)
      .enter()
      .append("line")
      .attr("id", function (d, i) {
        return 'edge' + i
      })
      .attr('marker-end', 'url(#arrowhead)')
      .style("stroke", "#ccc")
      .style("pointer-events", "none");

    let edgepaths = this.svg.selectAll(".edgepath")
      .data(this.links)
      .enter()
      .append('path')
      .attr('d', function (d) {
        return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y
      })
      .attr('class', 'edgepath')
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2)
      .attr('fill-opacity', 0)
      .attr('fill', 'blue')
      .attr('id', function (d, i) {
        return 'edgepath' + i
      })
      .style("pointer-events", "none");

    let edgelabels = this.svg.selectAll(".edgelabel")
      .data(this.links)
      .enter()
      .append('text')
      .style("pointer-events", "none")
      .attr('class', 'edgelabel')
      .attr('id', function (d, i) {
        return 'edgelabel' + i
      })
      .attr('dx', this.zoom/2)
      .attr('dy', 0)
      .attr('font-size', 10)
      .attr('fill', '#d30e13');

    edgelabels.append('textPath')
      .attr('xlink:href', function (d, i) {
        return '#edgepath' + i
      })
      .style("pointer-events", "none")
      .text(function (d, i) {
        return d.label
      });


    let node = this.svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(this.nodes)
      .enter().append("g");
    node.append("circle")
      .attr("r", 5)
      .attr("fill", "#000");
    let nodelabel = node.append("text")
      .text(function (d) {
        return d.id;
      })
      .attr('font-size', 10)
      .attr('x', 6)
      .attr('y', 10);
    node.append("title")
      .text(function (d) {
        return d.id;
      });
    node.on("click", (d) => {
      this.vertex = d.id;
      this.searchVertex();
    });


    this.svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#0f0f0f')
      .attr('stroke', '#090909');


    force.on("tick", function () {

      link.attr({
        "x1": function (d) {
          return d.source.x;
        },
        "y1": function (d) {
          return d.source.y;
        },
        "x2": function (d) {
          return d.target.x;
        },
        "y2": function (d) {
          return d.target.y;
        }
      });

      node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

      edgepaths.attr('d', function (d) {
        return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
      });

      edgelabels.attr('transform', function (d, i) {
        if (d.target.x < d.source.x) {
          let bbox = this.getBBox();
          let rx = bbox.x + bbox.width / 2;
          let ry = bbox.y + bbox.height / 2;
          return 'rotate(180 ' + rx + ' ' + ry + ')';
        }
        else {
          return 'rotate(0)';
        }
      });
    });
  }

}
