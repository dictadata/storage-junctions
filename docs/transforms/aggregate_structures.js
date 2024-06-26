class Accumulator {
}

// summary
this.aggregates = {
  "__summary": {
    "totals": "totals",
    "count": Accumulator,
    "qty": Accumulator,
    "value": Accumulator
  }
}

// group by
this.aggregates = {
  "category": {
    __fields: {},
    __accumulators: {
      "tools": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "supplies": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      }
    }
  }
}

// group by w/ summary
this.aggregates = {
  "category": {
    __fields: {},
    __accumulators: {
      "tools": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "supplies": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      }
    }
  },
  "__summary": {
    "category": "totals",
    "count": Accumulator,
    "qty": Accumulator,
    "value": Accumulator
  }
}

// nested
this.aggregates = {
  "category": {
    __fields: {},
    __accumulators: {
      "tools": {
        "item": {
          __fields: {},
          __accumulators: {
            "widget_1": {
              "count": Accumulator,
              "qty": Accumulator,
              "value": Accumulator
            },
            "widget_2": {
              "count": Accumulator,
              "qty": Accumulator,
              "value": Accumulator
            }
          }
        }
      },
      "supplies": {
        "item": {
          __fields: {},
          __accumulators: {
            "whatsit_1": {
              "count": Accumulator,
              "qty": Accumulator,
              "value": Accumulator
            },
            "whatsit_2": {
              "count": Accumulator,
              "qty": Accumulator,
              "value": Accumulator
            }
          }
        }
      }
    }
  }
}

// nested w/ subtotals and summary
this.aggregates = {
  "category": {
    __fields: {},
    __accumulators: {
      "tools": {
        "item": {
          __fields: {},
          __accumulators: {
            "widget_1": {
              "count": Accumulator,
              "qty": Accumulator,
              "value": Accumulator
            },
            "widget_2": {
              "count": Accumulator,
              "qty": Accumulator,
              "value": Accumulator
            }
          }
        }
      },
      "supplies": {
        "item": {
          __fields: {},
          __accumulators: {
            "whatsit_1": {
              "count": Accumulator,
              "qty": Accumulator,
              "value": Accumulator
            },
            "whatsit_2": {
              "count": Accumulator,
              "qty": Accumulator,
              "value": Accumulator
            }
          }
        }
      },
      "__summary": {
        "item": "subtotal",
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      }
    }
  },
  "__summary": {
    "category": "totals",
    "count": Accumulator,
    "qty": Accumulator,
    "value": Accumulator
  }
}

// multiple
this.aggregates = {
  "category": {
    __fields: {},
    __accumulators: {
      "tools": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "supplies": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      }
    }
  },
  "item": {
    __fields: {},
    __accumulators: {
      "widget_1": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "widget_2": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "whatsit_1": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "whatsit_2": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      }
    }
  }
}

// multiple w/ subtotals and summary
this.aggregates = {
  "category": {
    __fields: {},
    __accumulators: {
      "tools": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "supplies": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      }
    },
    "__summary": {
      "category": "subtotal",
      "count": Accumulator,
      "qty": Accumulator,
      "value": Accumulator
    }
  },
  "item": {
    __fields: {},
    __accumulators: {
      "widget_1": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "widget_2": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "whatsit_1": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      },
      "whatsit_2": {
        "count": Accumulator,
        "qty": Accumulator,
        "value": Accumulator
      }
    },
    "__summary": {
      "item": "subtotal",
      "count": Accumulator,
      "qty": Accumulator,
      "value": Accumulator
    }
  },
  "__summary": {
    "totals": "totals",
    "count": Accumulator,
    "qty": Accumulator,
    "value": Accumulator
  }
}
