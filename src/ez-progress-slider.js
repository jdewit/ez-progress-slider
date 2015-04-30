angular.module('ez.progressSlider', [])

.constant('EzProgressSliderConfig', {
  draggableTarget: false,
  draggableProgress: true,
  showProgressHandle: true,
  showTargetHandle: true,
  noInteraction: false
})

.directive('ezProgressSlider', ['$parse', 'EzProgressSliderConfig', function($parse, EzProgressSliderConfig) {
  return {
    restrict: 'EA',
    templateUrl: 'ez-progress-slider-tpl.html',
    replace: true,
    require: 'ngModel',
    scope: {
      target: '=?',
      config: '=?'
    },
    link: function(scope, $element, attrs, ngModel) {
      scope.options = angular.extend({}, EzProgressSliderConfig, scope.config);
      scope.hasTarget = !!attrs.target;

      for (var option in EzProgressSliderConfig) {
        if (!!attrs[option]) {
          scope.options[option] = $parse(attrs[option])(scope.$parent);
        }
      }

      var totalWidth;
      var $progressEl = $element.find('.progress');
      var $progressBarEl = $element.find('.progress-bar');
      var $progressSliderContainerEl = $element.parent();
      var $progressHandle = $element.find('.progress-handle');
      var $targetHandle = $element.find('.target-handle');
      var $textEl = $element.find('.progress-text');

      $progressBarEl.height($progressEl.height());

      var setWidth = function() {
        totalWidth = $progressSliderContainerEl.width();
      };

      var getPercent = function(x, y) {
        x = parseInt(x, 10);
        y = parseInt(y, 10);

        if (y > 0) {
          return Math.round(x / y * 100);
        }

        return 0;
      };

      var getPercentInPixels = function(percent) {
        setWidth();

        if (percent) {
          return parseInt((percent * totalWidth / 100).toFixed(0), 10);
        } else {
          return 0;
        }
      };

      var setProgress = function(fromX) {
        if (totalWidth <= 0) {
          return;
        }

        $progressBarEl.css({width: progressX + 'px'});
        $progressHandle.css({left: (progressX - 10) + 'px'});

        $textEl.text(Math.round(progress) + '%');

        if (progress <= 50) {
          $element.addClass('under-50');
        } else {
          $element.removeClass('under-50');
        }

        placeText();

        updateBar();
      };

      var updateBar = function() {
        if (scope.hasTarget) {
          if (progress < target) {
            $element.addClass('behind-target');
          } else {
            $element.removeClass('behind-target');
          }
        }
      };

      var placeText = function() {
        if (progressX < 35) {
          if (scope.options.noInteraction) {
            $textEl.css({left: (progressX + 5) + 'px'});
          } else {
            $textEl.css({left: (progressX + 20) + 'px'});
          }

          $textEl.css({color: '#333'});
        } else {
          $textEl.css({color: '#fff', left: '5px'});
        }
      };

      if (scope.options.draggableProgress && !scope.options.noInteraction) {
        $element.addClass('draggable-progress');

        interact($progressHandle[0]).draggable({
          axis: 'x',
          onstart: function() {
            progressX = getPercentInPixels(progress);
          },
          onmove: function(e) {
            progressX = progressX + e.dx;

            placeText();

            if (progressX < 0 || progressX > totalWidth) {
              progressX = progressX - e.dx;
              return;
            }

            progress = getPercent(progressX, totalWidth);

            setProgress();
          },
          onend: function() {
            setProgress();

            ngModel.$setViewValue(progress);

            scope.$apply();
          }
        });

        var clickHandler = function(e) {
          var $target = angular.element(e.target);

          progressX = e.offsetX;

          progress = getPercent(progressX, totalWidth);

          setProgress();

          ngModel.$setViewValue(progress);

          scope.$apply();
        };

        $progressEl.on('mousedown', clickHandler);

        $progressBarEl.on('mousedown', clickHandler);
      }

      if (scope.hasTarget) {

        var setTarget = function() {

          $targetHandle.css({left: getPercentInPixels(target) + 'px'});
          $targetHandle.attr('title', target + '%');

          updateBar();
        };

        if (scope.options.draggableTarget) {
          $element.addClass('draggable-target');

          interact($targetHandle[0]).draggable({
            axis: 'x',
            onstart: function() {
              targetX = getPercentInPixels(scope.target);
            },
            onmove: function(e) {
              targetX = targetX + e.dx;

              if (targetX < 0 || targetX > totalWidth) {
                targetX = targetX - e.dx;
                return;
              }

              target = getPercent(targetX, totalWidth);

              setTarget();
            },
            onend: function() {
              setTarget();

              scope.target = target;

              scope.$apply();
            }
          });
        }

        scope.$watch('target', function(newVal, oldVal) {
          if (newVal === oldVal) {
            return;
          }

          target = parseInt(newVal, 10) || 0;

          if (target > 100) {
            target = 100;
          } else if (target < 0) {
            target = 0;
          }

          setTarget();
        });

        // init
        var target = scope.target;
        var targetX = getPercentInPixels(target);
        setTarget();

      } else {
        scope.options.showTargetHandle = false;
      }

      ngModel.$render = function() {
        console.log('render', ngModel.$viewValue);
        progress = parseInt(ngModel.$viewValue, 10) || 0;

        if (progress > 100) {
          progress = 100;
        } else if (progress < 0) {
          progress = 0;
        }

        progressX = getPercentInPixels(progress);

        setProgress();
      };

      //scope.$watch('progress', function(newVal, oldVal) {
        //if (newVal === oldVal) {
          //return;
        //}

        //progress = parseInt(newVal, 10) || 0;

        //if (progress > 100) {
          //scope.progress = 100;

          //return;
        //} else if (progress < 0) {
          //scope.progress = 0;

          //return;
        //}

        //if (!!attrs.onChange) {
          //$parse(attrs.onChange)(scope.$parent, {progress: progress, target: target});
        //}

        //progressX = getPercentInPixels(progress);

        //setProgress();
      //});

      // init
      var progress = 0;
      var progressX = getPercentInPixels(progress);
      setProgress();

      // disable transitions after progress has loaded
      setTimeout(function() {
        $element.addClass('ez-loaded');
      }, 1000);
    }
  };
}])

;
