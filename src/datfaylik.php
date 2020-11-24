<?php
// $dir    = $_SERVER['DOCUMENT_ROOT'].'assets/images/svg';
$dir    = 'assets/images/svg';

//echo $dir."<br>";
$files1 = scandir($dir);
  // Оригинальный код - Chirp Internet: www.chirp.com.au
  // Пожалуйста, укажите это в хедере, если будете использовать данный код

  function getFileList($dir, $recurse=false)
  {
      // массив, хранящий возвращаемое значение
      $retval = array();

      // добавить конечный слеш, если его нет
      if(substr($dir, -1) != "/") $dir .= "/";

      // указание директории и считывание списка файлов
      $d = @dir($dir) or die("getFileList: Не удалось открыть каталог $dir для чтения");
      while(false !== ($entry = $d->read())) {

          // пропустить скрытые файлы
          if($entry[0] == ".") continue;
          if(is_dir("$dir$entry")) {
              $retval[] = array(
                  "name" => "$dir$entry/",
                  "size" => 0,
                  "lastmod" => filemtime("$dir$entry")
              );
              if($recurse && is_readable("$dir$entry/")) {
                  $retval = array_merge($retval, getFileList("$dir$entry/", true));
              }
          } elseif(is_readable("$dir$entry")) {
              $retval[] = array(
                  "path" => "$dir$entry",
                  "dir" =>  $dir,
                  "name" => "$entry",
//                  "predir" =>   $preDir
//                  "count" => $count,
//                  "size" => filesize("$dir$entry"),
//                  "lastmod" => filemtime("$dir$entry")
              );
          }
      }
      $d->close();

      return $retval;
  }
$files = getFileList($dir,true);




foreach ($files as $item) {
    if (stristr($item['path'], '.svg') === FALSE) {
    } else {
        $path = explode('/svg/',$item['dir']);
        $thirdLvlPath = explode('/',$path[1]);

        $nameTransform = explode('.',$item['name']);
        $name = strval($nameTransform[0]);


        if($thirdLvlPath[1] != '') {
            $svgs[$thirdLvlPath[0]][$thirdLvlPath[1]]->$name = (object)$item;
        }else{
            $Path = str_replace('/','',$path[1]);
            $svgs[$Path]->$name = $item;
        }
    }
}



//echo '<pre>';
//print_r($svgs);
//echo '</pre>';

//print_r($svgs['complex']);

echo json_encode($svgs);

