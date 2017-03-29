if (!window.FBA) {
    FBA = {};
}

FBA.Util = $.extend({}, FBA.Util, {
    loading: false,
    loadingPopover: null,
	displayLoadingMsg: function (toggle, customSettings) {
        var defaultSettings = {
            modalContent: '#pg-act-area',
            localContent: '#pleaseWaitLoading'
        };

        var settings = $.extend({}, defaultSettings, customSettings);

        if (toggle) {
            FBA.Util.loading = true;
            FBA.Util.loadingPopover = jQuery.AmazonPopover.displayPopover(
                {    
                    width: 250, 
                    localContent: settings.localContent, 
                    locationFunction: function (settings) {
                      var y_window = $(window).scrollTop();
                      var y_pg_act = $(settings.modalContent).offset().top;
                      var y = ((y_window > y_pg_act) ? y_window : y_pg_act) + 100;
                      while (y + 150 > y_window + $(window).height()) y -= 50;
                      return {
                        left: -(settings.width/2)+'px',
                        top: y+'px',
                        right: '0',
                        margin: '0% 50%'
                      }
                    },
                    modalContent: settings.modalContent,
                    modalFadeSpeed: 0,
                    modal: true,
                    showCloseButton: false
                }
            );
        } else {
            if (FBA.Util.loading) {
                FBA.Util.loadingPopover.destroy();
                FBA.Util.loading = false;
            }
        }
    },
    inViewport: function (offsetX, offsetY) {
        var win = $(window);
        return (offsetX >= win.scrollLeft() && 
            offsetX <= win.scrollLeft() + win.width() && 
            offsetY >= win.scrollTop() && 
            offsetY <= win.scrollTop() + win.height());
    },
    isValidEmailAddress: function (strEmail) {
        /*
		 * Verify the email input is correct.
         * right: abc@amazon.com
         *        some.thing123_home-001@amazon.com.cn
         *        etc.
         * wrong:
         *        abc@amazon.com,123@amazon.com
         *        .ab-c@amazon.com,
         *        abc@amazon...com
         *        abc@amazon.com;
         *        abc@amazon.com,
		 */
        var regex = /^[a-zA-Z0-9][a-zA-Z0-9.+_-]+@[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+$/;
        strEmail = strEmail.toString().replace(/^\s+/, '').replace(/\s+$/, '');
        if (!regex.test(strEmail)) {
          return false;
        }
        return true;
    },
    resetViewport: function (selector) {
        var $container = $(selector);
        if ($container.length == 1) {
            var offset = $container.offset();
            if (!FBA.Util.inViewport(offset.left, offset.top)) self.scrollTo(offset.left, offset.top - 7);
        }
    },
	ucfirst: function (str) {
		return '' + str.charAt(0).toUpperCase() + str.substr(1);
	},

    getRawNumber: function(val, decSign) {
        decSign     = decSign || '.';
        var reg     = new RegExp("([^0-9" + decSign + "])", "g");
        val         = val.replace(reg, '');

        if (decSign != '') {
            val = val.replace(decSign, ".");
        }

        return val;
    },

    getInputNumber: function(val, decSign) {
        val         = val.toString();
        var sign    = val.charAt(0) == '-' ? '-' : '';

        val = FBA.Util.getRawNumber(val, decSign);
        val = sign + val;

        return parseFloat(val);
    },

    getOutputNumber: function(val, decSign, thousSign) {
        val             = val || 0;
        val             = val.toString();
        var sign        = val.charAt(0) == '-' ? '-' : '';
        var decimal     = '';
        decSign         = decSign || '.';
        thousSign       = thousSign || ',';

        val     = FBA.Util.getRawNumber(val, decSign);
        var p   = val.indexOf(".");

        if (p != -1) {
            decimal = val.substr(p + 1);
            val     = val.substring(0, p);
        }

        var start       = (start = val.length) > 3 ? start % 3 : 0;
        var newVal      = sign + (start ? val.substr(0, start) + thousSign : '') + val.substr(start).replace(/(\d{3})(?=\d)/g, "$1" + thousSign);
        newVal          += decimal != '' ? (decSign + decimal) : '';

        return newVal;
    }
});

/*
 * FBA.Util.parseNumber
 * Takes in a localized number as a string and returns a number that can be used with JavaScript code.
 * The format is used to determine the group and decimal separators.
 *
 * FBA.Util.formatNumber
 * Takes in a JavaScript number returns a string representation of the format.
 *
 * FBA.Util.isValidNumber
 * Takes in a localized number as a string and determines if it's a valid number based on the format.
 *
 * format:
 *  #,###.##
 *  #   = Beginning of the number format
 *  ,   = Group separator
 *  ### = Group size
 *  .   = (optional) Decimal separator
 *  ##  = (optional) Decimal places
 */
 
(function() {

var localizedFloat  = parseFloat('1.2');
var separators      = [];

if (!isNaN(localizedFloat)) {
    separators = localizedFloat.toString().match(/[\., ]/) || [];
}

FBA.Util.DECIMAL_SEPARATOR      = (separators.length == 1 ? separators[0] : '');
FBA.Util.DEFAULT_NUMBER_FORMAT  = '#,###.##';

FBA.Util.getFormatParts = function(format) {
    var sizes = format.split(/[,\. ]/);
    
    var parts = {};
    
    parts.groupSize         = sizes[1].length;
    parts.groupSeparator    = format.substr(1, 1);
    parts.decimalPlaces     = (sizes.length > 2 ? sizes[2].length : 0);
    parts.decimalSeparator  = '';
    
    if (parts.decimalPlaces) {
        var decStart    = parts.groupSize + 2;
        var decEnd      = decStart;
        
        parts.decimalSeparator  = format.substr(decStart, 1);
    }
    
    return parts;
};

FBA.Util.parseNumber = function(number, format) {
    if (!format) {
        format = FBA.Util.DEFAULT_NUMBER_FORMAT;
    }
    
    var parts = FBA.Util.getFormatParts(format);
    
    number = number.toString().replace(new RegExp('\\' + parts.groupSeparator, 'g'), '');
    number = number.replace(parts.decimalSeparator, FBA.Util.DECIMAL_SEPARATOR);
    number = parseFloat(number);
    
    if (isNaN(number)) {
        return 0;
    }
    
    return number;
};

FBA.Util.formatNumber = function(number, format) {
    if (!format) {
        format = FBA.Util.DEFAULT_NUMBER_FORMAT;
    }
    
    var parts       = FBA.Util.getFormatParts(format);
    var numberParts = number.toString().split(FBA.Util.DECIMAL_SEPARATOR);
    var integer     = numberParts[0];
    var fraction    = (numberParts.length > 1 ? numberParts[1] : '0');
    
    formattedNumber = '';
    
    if (parts.decimalSeparator) {
        for (var i = parts.decimalPlaces - 1; i >= 0; i--) {
            if (fraction.length > i) {
                formattedNumber = fraction[i] + formattedNumber;
            } else {
                formattedNumber = '0' + formattedNumber;
            }
        }
        
        formattedNumber = parts.decimalSeparator + formattedNumber;
    }
    
    for (var i = integer.length - 1; i >= 0; i--) {
        for (var g = 0; g < parts.groupSize; g++) {
            formattedNumber = integer[i] + formattedNumber;
            
            if (i - 1 <= 0) {
                break;
            }
            
            i--;
        }
        
        if (i - 1 >= 0) {
            formattedNumber = parts.groupSeparator + formattedNumber;
        }
    }
    
    return formattedNumber;
};

FBA.Util.isValidNumber = function(number, format) {
    
};

})();


/*
 * FBA.Util.CapacityWidget
 *
 * Interface for the Capacity Widget.
 *
 * type:
 *  sortable
 *  nonSortable
 */

FBA.Util.CapacityWidget = {
    init: function(config) {
        config = $.extend({
            isAtWarningPercentage:  75,
            isAtRiskPercentage:     90
        }, config);
        
        var that = this;
        
        this.isAtWarningPercentage  = config.isAtWarningPercentage;
        this.isAtRiskPercentage     = config.isAtRiskPercentage;
        this.types                  = ['sortable', 'nonSortable'];
        this.popover                = null;
        
        this.typeToId = {
            sortable:       'sortable',
            nonSortable:    'non-sortable'
        }
        
        $.each(this.types, function() {
            var type = this;
            
            that['$' + type]                            = $('#fba-capacity-widget-type-' + that.typeToId[type]);
            that['$' + type + 'UtilizationPercentage']  = $('span.fba-capacity-widget-utilization-percentage', that['$' + type]);
            that['$' + type + 'UtilizationInteger']     = $('span.fba-capacity-widget-utilization-integer', that['$' + type]);
            that['$' + type + 'Msgs']                   = $('p.fba-capacity-widget-msg', that['$' + type]);
            that[type + 'Utilization']                  = parseInt(that['$' + type + 'UtilizationInteger'].html());
            that[type + 'Limit']                        = parseInt($('span.fba-capacity-widget-limit', that['$' + type]).html());
            that['$' + type + 'WarningInfo']            = $('#fba-capacity-widget-info-' + that.typeToId[type] + '-warning');
            that['$' + type + 'RiskInfo']               = $('#fba-capacity-widget-info-' + that.typeToId[type] + '-risk');
            that['$' + type + 'LimitInfo']              = $('#fba-capacity-widget-info-' + that.typeToId[type] + '-limit');
            that[type + 'CanShowWarningInfo']           = true;
            that[type + 'CanShowRiskInfo']              = true;
            that[type + 'CanShowLimitInfo']             = true;
        });
    },
    
    getLimit: function(type) {
        return this[type + 'Limit'];
    },
    
    hasLimit: function(type) {
        return (this['$' + type].length > 0);
    },
    
    getUtilization: function(type) {
        if (!this.hasLimit(type)) {
            return 0;
        }
        
        return this[type + 'Utilization'];
    },
    
    setUtilization: function(type, amount) {
        if (!this.hasLimit(type) || isNaN(amount)) {
            return;
        }
        
        this[type + 'Utilization'] = amount;
    },
    
    addCapacity: function(type, amount) {
        this.updateCapacity(type, amount);
    },
    
    removeCapacity: function(type, amount) {
        this.updateCapacity(type, amount, true);
    },
    
    updateCapacity: function(type, amount, remove) {
        if (!this.hasLimit(type)) {
            return;
        }
        
        amount      = parseInt(amount);
        var value   = this.getUtilization(type);
        
        if (!remove) {
            this.setUtilization(type, value + amount);
        } else {
            this.setUtilization(type, value - amount);
        }
    },
    
    getPercentage: function(type) {
        if (!this.hasLimit(type)) {
            return 0;
        }
        
        var percent = (this.getUtilization(type) / this.getLimit(type)) * 100;
        
        if (percent > 100) {
            percent = 100;
        }
        
        return percent;
    },
    
    refreshWidget: function(type) {
        if (!this.hasLimit(type)) {
            return;
        }
        
        this['$' + type + 'UtilizationInteger'].html(this.getUtilization(type));
        
        var $msgs       = this['$' + type + 'Msgs'].removeClass('fba-capacity-widget-msg-show');
        var $bar        = this['$' + type + 'UtilizationPercentage'].width(this.getPercentage(type) + '%');
        var $color      = $bar.closest('div');
        var that        = this;
        
        $color.removeClass('fba-capacity-widget-warning');
        $color.removeClass('fba-capacity-widget-risk');
        $color.removeClass('fba-capacity-widget-limit');
        $msgs.filter('p.fba-capacity-widget-msg').removeClass('fba-capacity-widget-msg-show');
        
        if (this.isAtLimit(type)) {
            $color.addClass('fba-capacity-widget-limit');
            $msgs.filter('p.fba-capacity-widget-msg-limit').addClass('fba-capacity-widget-msg-show');
        } else if (this.isAtRisk(type)) {
            $color.addClass('fba-capacity-widget-risk');
            $msgs.filter('p.fba-capacity-widget-msg-risk').addClass('fba-capacity-widget-msg-show');
        } else if (this.isAtWarning(type)) {
            $color.addClass('fba-capacity-widget-warning');
            $msgs.filter('p.fba-capacity-widget-msg-warning').addClass('fba-capacity-widget-msg-show');
        }
    },
    
    isAtWarning: function(type) {
        if (!this.hasLimit(type)) {
            return false;
        }
        
        var percent = this.getPercentage(type);
        
        return (percent >= this.isAtWarningPercentage);
    },
    
    isAtRisk: function(type) {
        if (!this.hasLimit(type)) {
            return false;
        }
        
        var percent = this.getPercentage(type);
        
        return (percent >= this.isAtRiskPercentage);
    },
    
    isAtLimit: function(type) {
        if (!this.hasLimit(type)) {
            return false;
        }
        
        return (this.getPercentage(type) >= 100);
    },
    
    isOverCapacity: function(type) {
        if (!this.hasLimit(type)) {
            return false;
        }
        
        return (this.getUtilization(type) > this.getLimit(type));
    },
    
    tryInfoPopover: function(type, input) {
        var modalContent = input;
        var localContent;
        
        if (this.isAtLimit(type) && this[type + 'CanShowLimitInfo']) {
            localContent = this['$' + type + 'LimitInfo'];
            
            this[type + 'CanShowWarningInfo']   = false;
            this[type + 'CanShowRiskInfo']      = false;
            this[type + 'CanShowLimitInfo']     = false;
        } else if (!this.isAtLimit(type)) {
            this[type + 'CanShowLimitInfo'] = true;
            
            if (this.popover) {
                  this.popover.destroy();
            }
        }
        
        // Only show popover if they have reached their limit at this time.
        // We may revisit this later.
        
        /*
        if (this.isAtRisk(type) && this[type + 'CanShowRiskInfo']) {
            localContent = this['$' + type + 'RiskInfo'];
            
            this[type + 'CanShowWarningInfo']   = false;
            this[type + 'CanShowRiskInfo']      = false;
            this[type + 'CanShowLimitInfo']     = true;
        } else if (!this.isAtRisk(type)) {
            this[type + 'CanShowRiskInfo'] = true;
        }
        
        if (this.isAtWarning(type) && this[type + 'CanShowWarningInfo']) {
            localContent = this['$' + type + 'WarningInfo'];
            
            this[type + 'CanShowWarningInfo']   = false;
            this[type + 'CanShowRiskInfo']      = true;
            this[type + 'CanShowLimitInfo']     = true;
        } else if (!this.isAtWarning(type)) {
            this[type + 'CanShowWarningInfo'] = true;
        }
        */
        
        if (localContent) {
            if (this.popover) {
                this.popover.destroy();
            }
            
            this.popover = FBA.Util.InfoPopover({
                modalContent: modalContent,
                localContent: localContent
            });
        } 
    }
};

/*
 * FBA.Util.CapacityItemManager
 *
 * A layer on top of FBA.Util.CapacityWidget to update it in real-time
 * when items are edited.
 *
 * config:
 *  rows        = rows that contain item information
 *  itemQty     = (optional) item quantity input
 *  itemRemove  = (optional) item remove checkbox
 *  itemType    = (optional) item type input
 *  itemGuidanceGroup = (optional) item ASIN group
 *  itemGuidanceGroupLimit = (optional) item ASIN group limit
 */
 
FBA.Util.CapacityItemManager = {
    init: function(config) {
        config = $.extend({
            itemQty:                        'input.fldQty',
            itemUnitsPerCase:               'input.fldUnitsPerCase',
            itemQtyCases:                   'input.fldQtyCases',
            itemRemove:                     'input.removebox',
            itemType:                       'input.capacityType',
            itemGuidanceGroup:              'input.asinGuidanceGroup',
            itemGuidanceGroupLimit:         'input.asinGuidanceLimit',
            limitQtyPlanned:                'input.limitQtyPlanned',
            limitQtyAllowShipQtyRangeMin:   'input.limitQtyAllowShipQtyRangeMin',
            limitQtyAllowShipQtyRangeMax:   'input.limitQtyAllowShipQtyRangeMax'
        }, config);
        
        this.itemQty                        = config.itemQty;
        this.itemUnitsPerCase               = config.itemUnitsPerCase;
        this.itemQtyCases                   = config.itemQtyCases;
        this.itemRemove                     = config.itemRemove;
        this.itemType                       = config.itemType;
        this.itemGuidanceGroup              = config.itemGuidanceGroup;
        this.itemGuidanceGroupLimit         = config.itemGuidanceGroupLimit;
        this.limitQtyPlanned                = config.limitQtyPlanned;
        this.limitQtyAllowShipQtyRangeMin   = config.limitQtyAllowShipQtyRangeMin;
        this.limitQtyAllowShipQtyRangeMax   = config.limitQtyAllowShipQtyRangeMax;
        this.items                          = [];
        this.limitQtyItems                  = [];
        this.guidanceItems                  = {};
        FBA.Util.CapacityWidget.init();
    
        this.addItems(config.rows);
    },
    
    addItems: function(rows) {
        var that = this;
        
        $(rows).each(function() {
            var $typeInput              = $(that.itemType, this);
            var $itemGuidanceGroup      = $(that.itemGuidanceGroup, this);
            var $itemGuidanceGroupLimit = $(that.itemGuidanceGroupLimit, this);
            var $limitQtyPlanned        = $(that.limitQtyPlanned, this);
            
            if ($typeInput.length && $.trim($typeInput.val())) {
                that.items.push(new FBA.Util.CapacityItem({
                    row:        this,
                    itemQty:    that.itemQty,
                    itemRemove: that.itemRemove,
                    itemType:   that.itemType
                }));
            }
            
            var guidanceGroup = $.trim($itemGuidanceGroup.val());
                     
            if ($itemGuidanceGroup.length && guidanceGroup) {
                if (!that.guidanceItems[guidanceGroup]) {
                    that.guidanceItems[guidanceGroup] = {                       
                        items:           [],
                        max:             parseInt($itemGuidanceGroupLimit.val()),
                        currentQuantity: 0
                    };                    
                }
                                                
                that.guidanceItems[guidanceGroup].items.push(new FBA.Util.GuidanceItem({
                    row:           this,
                    itemQty:       that.itemQty,
                    guidanceGroup: that.itemGuidanceGroup,
                    itemRemove:    that.itemRemove,
                    itemType:      that.itemType
                }));        

               that.updateGuidanceGroup(guidanceGroup);        
            }
            
            if ($limitQtyPlanned.length) {
                that.limitQtyItems.push(new FBA.Util.LimitQtyItem({
                    row:                            this,
                    itemQty:                        that.itemQty,
                    itemUnitsPerCase:               that.itemUnitsPerCase,
                    itemQtyCases:                   that.itemQtyCases,
                    itemRemove:                     that.itemRemove,
                    limitQtyPlanned:                that.limitQtyPlanned,
                    limitQtyAllowShipQtyRangeMin:   that.limitQtyAllowShipQtyRangeMin,
                    limitQtyAllowShipQtyRangeMax:   that.limitQtyAllowShipQtyRangeMax
                }));
            }
        });
    },
    
    updateQty: function() {
        $.each(this.items, function() {
            this.updateQty();
        });
    },
    
    updateGuidanceGroup: function(key) {
        var group = this.guidanceItems[key];
        if (!group) {
            return;
        }

        //zero out total and then add up row quantity        
        group.currentQuantity = 0;
        $.each(group.items, function() {
            if (!this.removed) {
                var quantity =  parseInt(this.$qty.val()) || 0;
                group.currentQuantity += quantity;              
            }
        }); 

        //if we went over guidance loop back over
        //results and set error messaging else make sure 
        //we remove error messaging as they might have come back under guidance.
        $.each(group.items, function() {
            this.updateQuantityCounter(group.max - group.currentQuantity);
            //zero out total and then add up row quantity
            if (group.max < group.currentQuantity) {
                this.addError();         
            } else {
                this.removeError();
            }
        });             
    },

    resetQty: function() {
        $.each(this.items, function() {
            this.resetQty();
        });
    },
    
    removeAllItems: function() {
        $.each(this.items, function() {
            this.destroy();
        });
        
        this.items = [];
    },
    
    isAddingCapacity: function(type) {
        var isAddingCapacity = false;
        
        $.each(this.items, function() {
            if (this.type == type && this.isAddingCapacity()) {
                isAddingCapacity = true;
            }
        });
        
        return isAddingCapacity;
    },
    
    canSubmitAllCapacity: function() {
        var msgs = [];
        
        $.each(FBA.Util.CapacityWidget.types, function() {
            var type    = this;
            var over    = FBA.Util.CapacityWidget.isOverCapacity(type);
            var change  = FBA.Util.CapacityItemManager.isAddingCapacity(type);
            
            if (over && change) {
                msgs.push(FBA.Strings['Alert_OverCapacity_' + type]);
            }
        });
        
        // Check asin guidance
        
        var overGuidance = false;
        
        $.each(this.guidanceItems, function() {
            //if quantity being added is 0 let them pass 
            //guidance check
            if (this.currentQuantity > 0 && (this.max < this.currentQuantity)) {
                overGuidance = true;   
            }            
        });

        if (overGuidance) {
            msgs.push(FBA.Strings["Alert_QtyOverGuidance"]);    
        }
        
        // Check limit qty
        
        var outOfRange = false;
        
        $.each(this.limitQtyItems, function() {
            if (this.isOutOfQtyRange()) {
                outOfRange = true;
            }
        });
        
        if (outOfRange) {
            msgs.push(FBA.Strings["Error_LimitQty"]);
        }
        
        // Show errors
        
        if (msgs.length) {
            alert(msgs.join('\n\n'));
            return false;
        }
        
        return true;
    }
};

/* FBA.Util.GuidanceItem
  Keeps track of row state and quantity based on guidance limits. 
  Responsible for adding remving error state for quantity input as well
  as error state is kept in row and not in capacity manager. 
*/
FBA.Util.GuidanceItem = function(config) {
    config = $.extend({
        errorClass:         'fldError',
        guidanceErrorClass: 'itemError'        
    }, config);
    
    this.$row                   = $(config.row);
    this.$qty                   = $(config.itemQty, this.$row);
    this.$guidanceGroup         = $(config.guidanceGroup, this.$row);
    this.$remove                = $(config.itemRemove, this.$row);
    this.$guidanceMessageTarget = $('div.guidance-info', this.$row);
    this.$fldUnitsPerCase       = $('input.fldUnitsPerCase',this.$row);
    this.$fldQtyCases           = $('input.fldQtyCases',this.$row);
    this.errorClass             = config.errorClass;
    this.guidanceErrorClass     = config.guidanceErrorClass;
   
    this.removed        = false;
    var that            = this;
    
    this.$qty.bind('keyup FBA.Util.CapacityItem.updateQty', function(e, from) {
        that.updateQty();
    });
    
    this.$remove.click(function() {
        // Based on click event, so needs to be removed when not checked.
        if (that.$remove.attr('checked')) {
            that.removed = false;
        } else {
            that.removed = true;
        }
        that.updateQty();
    });
};

FBA.Util.GuidanceItem.prototype = {
    updateQty: function() {     
       FBA.Util.CapacityItemManager.updateGuidanceGroup(this.$guidanceGroup.val());
    },
    
    isRemoved: function() {
        return this.removed;
    },
        
    addError: function() {
        this.$qty.addClass(this.errorClass);   
        
        //add error to case packed item inputs
        //if there are there
        if (this.$fldUnitsPerCase) {
            this.$fldUnitsPerCase.addClass(this.errorClass);         
            this.$fldQtyCases.addClass(this.errorClass); 
        }
        
        //highlight info div as well
        this.$guidanceMessageTarget.addClass(this.guidanceErrorClass);
    },
    
    removeError: function() {
        this.$qty.removeClass(this.errorClass);  
        //remove error to case packed item inputs
        //if there are there
        if (this.$fldUnitsPerCase) {
            this.$fldUnitsPerCase.removeClass(this.errorClass);         
            this.$fldQtyCases.removeClass(this.errorClass); 
        }
        
        this.$guidanceMessageTarget.removeClass(this.guidanceErrorClass);
    },
    
    updateQuantityCounter: function(num) {
        //not updating counter.
        //this.$guidanceMessageTarget.children('span').text(num);
    }
};

/*
 * FBA.Util.CapacityItem
 *
 * Keeps track of each row state and item quantity to properly
 * update FBA.Util.CapacityWidget in real-time when item quantities
 * are updated.
 *
 * config:
 *  row         = row that this item belongs to.
 *  itemQty     = (optional) item quantity input
 *  itemRemove  = (optional) item remove checkbox
 *  itemType    = (optional) item type input
 */
 
FBA.Util.CapacityItem = function(config) {
    this.$row           = $(config.row);
    this.$qty           = $(config.itemQty, this.$row);
    this.$remove        = $(config.itemRemove, this.$row);
    this.type           = ($(config.itemType, this.$row).val() == 'SORTABLE' ? 'sortable' : 'nonSortable');
    this.defaultQty     = parseInt(this.$qty.val()) || 0;
    this.oldQty         = this.defaultQty;
    var that            = this;
    
    this.$qty.bind('keyup FBA.Util.CapacityItem.updateQty', function(e, from) {
        that.updateQty(false, from);
    });
    
    this.$remove.click(function() {
        // Based on click event, so needs to be removed when not checked.
        if (that.$remove.attr('checked')) {
            that.updateQty(true);
        } else {
            that.resetQty();
        }
    });
};

FBA.Util.CapacityItem.prototype = {
    updateQty: function(force, from) {
        if (this.isRemoved() && !force) {
            return;
        }
        
        var capacity    = FBA.Util.CapacityWidget.getUtilization(this.type);
        var qty         = parseInt(this.$qty.val()) || 0;
        
        FBA.Util.CapacityWidget.setUtilization(this.type, capacity - this.oldQty + qty);
        FBA.Util.CapacityWidget.refreshWidget(this.type);
        FBA.Util.CapacityWidget.tryInfoPopover(this.type, from || this.$qty);
        
        this.oldQty = qty;
    },
    
    isRemoved: function() {
        return this.$remove.attr('checked');
    },
    
    resetQty: function() {
        var capacity    = FBA.Util.CapacityWidget.getUtilization(this.type);
        var qty         = parseInt(this.$qty.val()) || 0;
        
        FBA.Util.CapacityWidget.setUtilization(this.type, capacity - qty + this.defaultQty);
        FBA.Util.CapacityWidget.refreshWidget(this.type);
        
        this.oldQty = this.defaultQty;
    },
    
    isAddingCapacity: function() {
        return (this.oldQty > this.defaultQty);
    },
    
    destroy: function() {
        this.removeQty();
    }
};

/*
 * FBA.Util.LimitQtyItem
 *
 * Keeps track of each row state and item quantity to determine
 * if items are out of planned qty range
 *
 * config:
 *  row                             = row that this item belongs to.
 *  itemQty                         = item quantity input
 *  itemRemove                      = item remove checkbox
 *  limitQtyPlanned                 = original planned quantity
 *  limitQtyAllowShipQtyRangeMin    = min item qty
 *  limitQtyAllowShipQtyRangeMax    = max item qty
 */
 
FBA.Util.LimitQtyItem = function(config) {
    config = $.extend({
        errorClass: 'fldLimitQtyError',
        errorMsg:   '#limitQtyErrorMsg'
    }, config);
    
    this.$row                           = $(config.row);
    this.$qty                           = $(config.itemQty, this.$row);
    this.$unitsPerCase                  = $(config.itemUnitsPerCase, this.$row);
    this.$qtyCases                      = $(config.itemQtyCases, this.$row);
    this.$remove                        = $(config.itemRemove, this.$row);
    this.$limitQtyPlanned               = $(config.limitQtyPlanned, this.$row);
    this.$limitQtyAllowShipQtyRangeMin  = $(config.limitQtyAllowShipQtyRangeMin, this.$row);
    this.$limitQtyAllowShipQtyRangeMax  = $(config.limitQtyAllowShipQtyRangeMax, this.$row);
    this.$errorMsg                      = $(config.errorMsg);
    this.errorClass                     = config.errorClass;
    var that                            = this;
    
    this.$qty.bind('blur', function() {
        that.validateQty();
    });
    
    this.$unitsPerCase.blur(function() {
        that.validateQty();
    });
    
    this.$qtyCases.blur(function() {
        that.validateQty();
    });
    
    this.$remove.click(function() {
        // Based on click event, so needs to be removed when not checked.
        if (that.$remove.attr('checked')) {
            that.validateQty();
        } else {
            that.validateQty(true);
        }
    });
};

FBA.Util.LimitQtyItem.prototype = {
    validateQty: function(remove) {
        if (this.popover) {
            this.popover.destroy();
        }
        
        var qty     = parseInt($.trim(this.$qty.val()));
        var planned = parseInt($.trim(this.$limitQtyPlanned.val()));
        var min     = parseInt($.trim(this.$limitQtyAllowShipQtyRangeMin.val()));
        var max     = parseInt($.trim(this.$limitQtyAllowShipQtyRangeMax.val()));
        
        if (remove || (qty >= min && qty <= max)) {
            this.$qty.removeClass(this.errorClass);
            this.$unitsPerCase.removeClass(this.errorClass);
            this.$qtyCases.removeClass(this.errorClass);
        } else {
            this.$qty.addClass(this.errorClass);
            this.$unitsPerCase.addClass(this.errorClass);
            this.$qtyCases.addClass(this.errorClass);
            
            this.popover = FBA.Util.InfoPopover({
                modalContent:   this.$qty,
                literalContent: $.trim(this.$errorMsg.html().replace('{planned}', planned).replace('{min}', min).replace('{max}', max)),
                skin:           'alert'
            });
        }
    },
    
    isOutOfQtyRange: function() {
        return this.$qty.hasClass(this.errorClass);
    },
    
    destroy: function() {
        if (this.popover) {
            this.popover.destroy();
        }
    }
};

/*
 * FBA.Util.InfoPopover
 *
 * Displays a small popover below just below desired element to give the user contextual information.
 *
 * modalContent     = Element to show popover under.
 * literalContent   = Content to use within the popover (use either literalContent or localContent, not both).
 * localContent     = Element containing the popover HTML (use either literalContent or localContent, not both).
 */
 
FBA.Util.InfoPopover = function(config) {
    return $.AmazonPopover.displayPopover($.extend({
        width:              285,
        modal:              false,
        showCloseButton:    true,
        hidePause:          5000,
        modalFadeSpeed:     0,
        clone:              true,
        
        locationFunction: function(settings) {
            var $modalContent   = $(config.modalContent).eq(0);
            var offset          = $modalContent.offset();
            
            return {
                left:   offset.left + $modalContent.outerWidth() / 2 - settings.width / 2 + 'px',
                top:    offset.top + $modalContent.outerHeight() + 5 + 'px',
                right:  '0',
                margin: '0'
            }
        }
    }, config));
};

/*
 * $(filter)
 *      .enableAmznButton()
 *      .disableAmznButton()
 *      .toggleAmznButton([disable])
 *      .enable()
 *      .disable()
 */

(function ($) {
    var buttonClasses = [
        "btn-lg-pri", "btn-lg-sec",
        "btn-md-pri", "btn-md-sec",
        "btn-sm-pri", "btn-sm-sec",
        "btn-lg-pri-arrowl", "btn-lg-pri-arrowr",
        "btn-lg-sec-arrowl", "btn-lg-sec-arrowr",
        "btn-md-pri-arrowl", "btn-md-pri-arrowr",
        "btn-md-sec-arrowl", "btn-md-sec-arrowr"
    ];
    
    var changeState = function ($buttons, state) {
        return $buttons.filter(".amznBtn").each(function () {
            var $button = $(this)[state]();
            
            $.each(buttonClasses, function (i, cls) {
                var ghostCls = cls + "-ghost";
                
                if (state == "enable" && $button.hasClass(ghostCls)) {
                    $button.addClass(cls);
                    $button.removeClass(ghostCls);
                    
                    return;
                } else if (state == "disable" && $button.hasClass(cls)) {
                    $button.addClass(ghostCls);
                    $button.removeClass(cls);
                    
                    return;
                }
            });
        });
    }
    
    $.fn.enableAmznButton = function () {
        return changeState(this, "enable");
    };
    
    $.fn.disableAmznButton = function () {
        return changeState(this, "disable");
    };
    
    $.fn.enable = function () {
        return this.removeAttr("disabled");
    };
    
    $.fn.disable = function () {
        return this.attr("disabled", true);
    };
})(jQuery);

function hasClass(el, cls) {
    if (el && el.className) {
        return el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }
}
function addClass(el, cls) {
    if (el) {
        if (el[0] && el.tagName != 'SELECT') {
            for (var i = 0; i < el.length; i++) {
                addClass(el[i], cls);
            }
        } else {
            if (!hasClass(el, cls)) el.className += " " + cls;
        }
    }
}
function removeClass(el, cls) {
    if (el) {
        if (el[0] && el.tagName != 'SELECT') {
            for (var i = 0; i < el.length; i++) {
                removeClass(el[i], cls);
            }
        } else {
            if (hasClass(el, cls)) {
                var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
                el.className = el.className.replace(reg, ' ');
            }
        }
    }
}
function replaceClass(el, oldcls, newcls) {
    if (el) {
        if (hasClass(el, oldcls)) {
            var reg = new RegExp('(\\s|^)' + oldcls + '(\\s|$)');
            el.className = el.className.replace(reg, " " + newcls);
        }
    }
}
function getElementsByClassName(cls, tag, elm) {
    tag = tag || "*";
    elm = elm || document;
    var els = (tag == "*" && elm.all) ? elm.all : elm.getElementsByTagName(tag);
    var returnEls = [];
    for (var i = 0; i < els.length; i++) {
        if (hasClass(els[i], cls)) {
            returnEls.push(els[i]);
        }
    }
    return returnEls;
}
function trim(str) {
    return (str.length > 0) ? str.replace(/^\s*|\s*$/g, "") : str;
}
function inputDefaultToggle(el, defaultVal, defaultClass) {
    if (el) {
        el.onfocus = function () {
                                if (this.value == defaultVal) {
                                    this.value = '';
                                    removeClass(this, defaultClass);
                                }
                     };
        el.onblur = function () { 
                                if (trim(this.value) == '') {
                                    this.value = defaultVal;
                                    addClass(this, defaultClass);
                                } 
                    };
        el.onchange = function () {
                                if (this.value != defaultVal) {
                                    removeClass(this, defaultClass);
                                } else if (trim(this.value) == '') {
                                    this.value = defaultVal;
                                    addClass(this, defaultClass);
                                }
                    };
        if (el.value == defaultVal || trim(el.value) == '') {
            addClass(el, defaultClass);
            el.value = defaultVal;
        }
    }
}
function disableFields(el, bool, except) {
    bool = (bool == undefined) ? true : bool;
    if (el) {
        var fields = el.getElementsByTagName('input');
        for (var i = 0; i < fields.length; i++) {
            if (!except || fields[i] !== except) fields[i].disabled = bool;
        }
        fields = el.getElementsByTagName('select');
        for (i = 0; i < fields.length; i++) {
            if (!except || fields[i] !== except) fields[i].disabled = bool;
        }
        fields = el.getElementsByTagName('textarea');
        for (i = 0; i < fields.length; i++) {
            if (!except || fields[i] !== except) fields[i].disabled = bool;
        }
    }
}
function numbersOnly(field, e, dec) {
    var key;
    var keychar;
    
    if (window.event) key = window.event.keyCode;
    else if (e) key = e.which;
    else return true;
    keychar = String.fromCharCode(key);
    
    // control keys
    if ((key===null) || (key==0) || (key==8) || (key==9) || (key==27)) return true;
    
    // numbers
    else if ((("0123456789").indexOf(keychar) > -1)) return true;
    
    //decimal (internationalize?)
    else if (dec && (keychar == ".") && (field.value.indexOf(".") < 0)) return true;

    else return false;
}
function getNextElement(field) {
  var fieldFound = false;
  if (field.form) {
      var form = field.form;
      for (var e = 0; e < form.elements.length; e++) {
        if (fieldFound && form.elements[e].type != 'hidden') break;
        if (field == form.elements[e]) fieldFound = true;
      }
      return form.elements[e % form.elements.length];
  } else return false;
}
function tabOnEnter(field, e) {
  var keyCode = document.layers ? e.which : document.all ? e.keyCode : e.keyCode;
  if (keyCode != 13) return true;
  else {
    var nextElement = getNextElement(field);
    if (nextElement) {
        nextElement.focus();
        if (nextElement.type == 'text' || nextElement.type == 'file' || nextElement.type == 'password') nextElement.select();
        return false;
    } else return false;
  }
}
function isInt(val) {
     return isNaN(parseInt(val)) ? false : true;
}
function isNumeric(val) {
     return isNaN(parseFloat(val)) ? false : true;
}
function makeInt(val) {
    return isNaN(parseInt(val)) ? 0 : parseInt(val, 10);
}
function makeNumeric(val) {
    return isNaN(parseFloat(val)) ? 0 : parseFloat(val);
}
function isASCIIPrintable(str) {
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) < 32 || str.charCodeAt(i) > 126) {
            return false;
        }
    }
    return true;
}

function in_array(needle, haystack, strict) {
    strict = !!strict;
    for (var i in haystack) {
        if ((strict && haystack[i] === needle) || (!strict && haystack[i] == needle)) return true;
    }
    return false;
}

function getParentByTagName(el, tag) {
    var parent = el.parentNode;
    while (parent && parent.tagName.toLowerCase() != tag.toLowerCase()) {
        parent = parent.parentNode;
    }
    if (parent && parent.tagName.toLowerCase() == tag.toLowerCase()) return parent;
    else return false;

}

function initAltRemoveBoxes(callback) {
	function handleAltRemoveBoxes(el, callback, e) {
		var $el = $(el),
			$altEl = $el.parent(),
			$row = $el.parents('tr:first'),
			row = $row.get(0);

			$altEl.removeClass(el.className + ' ' + el.className + '-checked');

			if (el.checked !== true) {
				el.checked = true;
				$altEl.addClass(el.className + '-checked');
				$row
					.addClass('dt-disabled')
					.find(':input')
						.removeClass('fldError');
				if (row) {
					disableFields(row, true, el);
				}
			} else {
				el.checked = false;
				$altEl.addClass(el.className);
				$row.removeClass('dt-disabled');
				if (row) {
					disableFields(row, false);
				}
			}

			if (callback) callback(e);

			return false;
	}
	
    $('input.removebox:checkbox')
		.live('click', function (e) {	
			return handleAltRemoveBoxes(this, callback, e);
		});
	
	$('div.removebox, div.removebox-checked')
		.live('click', function () {
			$(this).children('input').click();
		});
}

function createAltRemoveBoxes(el) {
    return;
}
function styleRemoveBoxes() {
    var els = document.getElementsByTagName('input');
    for (var i = 0; i < els.length; i++) {
        if (els[i].type == 'checkbox' && els[i].className == 'removebox') {
            createAltRemoveBoxes(els[i]);
        }
    }
}
function getAbsPos(el) {
    var result = [];
    result.X = 0;
    result.Y = 0;
    while (el !== null) {
        result.X += el.offsetLeft;
        result.Y += el.offsetTop;
        el = el.offsetParent;
    }
    return result;
}
function isUnsaved(elm) {
    elm = elm || document;
    var fields = elm.getElementsByTagName('input');
    var textFieldTypes = ['text', 'file', 'password'];
    var checkFieldTypes = ['radio', 'checkbox'];
    for (var i = 0; i < fields.length; i++) {
        if (!fields[i].disabled && !fields[i].readOnly) {
            if (in_array(fields[i].type, textFieldTypes)) {
                if (fields[i].value != fields[i].defaultValue) return true;
            } else if (in_array(fields[i].type, checkFieldTypes)) {
                if (fields[i].checked != fields[i].defaultChecked) return true;
            }
        }
    }
    fields = elm.getElementsByTagName('textarea');
    for (i = 0; i < fields.length; i++) {
        if (!fields[i].disabled && !fields[i].readOnly && fields[i].value != fields[i].defaultValue) return true;
    }
    fields = elm.getElementsByTagName('select');
    for (i = 0; i < fields.length; i++) {
        for (var o = 0; o < fields[i].options.length; o++) {
            if (!fields[i].disabled && !fields[i].readOnly && fields[i].options[o].selected != fields[i].options[o].defaultSelected) return true;
        }
    }
    return false;
}
function fillValues(str) {
  var vals = arguments[1] || [], passthru = arguments[2] || false;
  str = str.replace(/\{([^\}]+)\}/g, function () { return vals[arguments[1]] !== false ? vals[arguments[1]] : passthru ? arguments[0] : ''; });
  return str;
}
function prepFields() {
    $('input.numeric').live('keypress', function (event) {
        return numbersOnly(this, event, true);
    });
    $('input.integer').live('keypress', function (event) {
        return numbersOnly(this, event, false);
    });
}
