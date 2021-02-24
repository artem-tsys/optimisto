<?php
    echo json_encode('<div class="s3d-pl__plane">
            <div class="s3d-pl__type">тип <span data-key="type"><span/></div>
                <img class="s3d-pl__image" data-key="src">
                <table class="s3d-pl__table">
                  <tbody><tr class="s3d-pl__row">
                    <td class="s3d-pl__value" data-key="number"></td>
                    <td class="s3d-pl__name">№ квартиры</td>
                  </tr>
                  <tr class="s3d-pl__row">
                    <td class="s3d-pl__value" data-key="floor"></td>
                    <td class="s3d-pl__name">Этаж</td>
                  </tr>
                  <tr class="s3d-pl__row">
                    <td class="s3d-pl__value" data-key="rooms"></td>
                    <td class="s3d-pl__name">Комнаты</td>
                  </tr>
                  <tr class="s3d-pl__row">
                    <td class="s3d-pl__value" data-key="area"></td>
                    <td class="s3d-pl__name">Площадь м2</td>
                  </tr>
                </tbody></table>
                <div class="s3d-pl__buttons">
                <button type="button" class="s3d-pl__link js-s3d-pl__link" data-key="id">Подробнее</button>
                  <label data-key="id" class="s3d-pl__add-favourites js-s3d-add__favourites">
                    <input type="checkbox" data-key="checked">
                    <svg>
                      <use xlink:href="#icon-favourites"></use>
                    </svg>
                  </label>
            </div>
    <div/>')
?>