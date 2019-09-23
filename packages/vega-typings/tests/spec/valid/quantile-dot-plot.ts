import { Spec } from 'vega';

export const spec: Spec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "width": 400,
  "padding": 5,

  "signals": [
    {
      "name": "numDots", "value": 50,
      "bind": {"input": "range", "min": 10, "max": 200, "step": 1}
    },
    {"name": "step", "update": "1.25 * sqrt(20 / numDots)"},
    {"name": "size", "update": "scale('x', step) - scale('x', 0)"},
    {"name": "area", "update": "size * size"},
    {"name": "height", "update": "(span(ext) + 1) * size"},
    {
      "name": "select", "value": 0,
      "on": [
        {
          "events": "click, [mousedown, window:mouseup] > mousemove",
          "update": "clamp(invert('x', x()), 0, 30)"
        },
        {
          "events": "dblclick",
          "update": "0"
        }
      ]
    }
  ],

  "data": [
    {
      "name": "quantiles",
      "transform": [
        {
          "type": "sequence", "as": "p",
          "start": {"signal": "0.5 / numDots"},
          "step": {"signal": "1 / numDots"},
          "stop": 1
        },
        {
          "type": "formula", "as": "value",
          "expr": "quantileLogNormal(datum.p, log(11.4), 0.2)"
        },
        {
          "type": "dotbin",
          "field": "value",
          "step": {"signal": "step"}
        },
        {
          "type": "stack",
          "groupby": ["bin"]
        },
        {
          "type": "extent",
          "field": "y1",
          "signal": "ext"
        }
      ]
    }
  ],

  "scales": [
    {
      "name": "x",
      "domain": [0, 30],
      "range": "width"
    },
    {
      "name": "y",
      "domain": {"signal": "[0, height / size]"},
      "range": "height"
    }
  ],

  "axes": [
    {"scale": "x", "orient": "bottom"}
  ],

  "marks": [
    {
      "type": "symbol",
      "from": {"data": "quantiles"},
      "encode": {
        "enter": {
          "x": {"scale": "x", "field": "bin"},
          "y": {"scale": "y", "signal": "datum.y0 + 0.5"},
          "size": {"signal": "area"}
        },
        "update": {
          "fill": {"signal": "datum.bin < select ? 'firebrick' : 'steelblue'"}
        }
      }
    },
    {
      "type": "rule",
      "interactive": false,
      "encode": {
        "update": {
          "x": {"scale": "x", "signal": "select"},
          "y": {"value": 0},
          "y2": {"signal": "height"},
          "stroke": {"signal": "select ? '#ccc': 'transparent'"}
        }
      }
    }
  ]
};