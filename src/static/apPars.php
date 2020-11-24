<?php
session_start();

class ApiDevbase
{
    public function curl($method, $url, $data = null)
    {

        $new_url = 'https://api-devbase.vip-saga.com.ua/v1/' . $url;

        if ($method == "GET") $new_url .= '?' . http_build_query($data);

        $curlOptions = [
            CURLOPT_URL => $new_url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "GET",
        ];

        if ($method == "POST") {

            $curlOptions[CURLOPT_CUSTOMREQUEST] = 'POST';
            $curlOptions[CURLOPT_POSTFIELDS] = json_encode($data);
            $curlOptions[CURLOPT_HTTPHEADER] = array('Content-Type: application/json');
        }

        $ch = curl_init();

        curl_setopt_array($ch, $curlOptions);

        $result = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        $code = (int)$code;

        return ['data' => json_decode($result, true), 'code' => $code];
    }

}


function getToken(){
    $devbase = new ApiDevbase();
    $curTime = time();
//    $value = get_field( "block_2", 'option');
    $value['token'] = $_SESSION['token'];

    $data = $devbase->curl('GET', 'apartments',
        [
            'access_token'=>$value['token'],
            'option' => [
                'id'=> 1
            ]
        ]);

    if(($curTime>$value['token_time']) || ($data['code'] == 400 || $data['code'] == 403)){
//    if($data['code'] == 400 || $data['code'] == 403){
        $data = $devbase->curl('POST', 'authentication', ['api_key'=>'11c5fcebaa65b560eaf06c3fbeb481ae44b8d611']);

        $_SESSION['token'] = $data['data']['access_token'];
        $_SESSION['time'] = $data['data']['expires_exp'];
    }

}
function getFlatById($id){
    getToken();
    $value['token'] = $_SESSION['token'];
    $devbase = new ApiDevbase();
//    $value = get_field( "block_2", 'option');
    $data = $devbase->curl('GET', 'apartments',
        [
            'access_token'=>$value['token'],
            'option' => [
                'id'=>$id
//                'id'=>$_POST['id']
            ]
        ]);
    $json = json_encode($data['data']['data']);
    echo $json;
}
function getFlats(){
    getToken();
    $value['token'] = $_SESSION['token'];
    $devbase = new ApiDevbase();
//    $value = get_field( "block_2", 'option');
    $data = $devbase->curl('GET', 'apartments',
        [
            'access_token'=>$value['token'],
            'option' => [
                'project_id' => 1,
                'type_object' => 1
            ]
        ]);
    $json = json_encode($data['data']['data']);
    echo $json;
}

//print_r(getFlats());
//print_r($_POST);
function getFloor($dom,$floor){
    getToken();
    $devbase = new ApiDevbase();
//    $value = get_field( "block_2", 'option');
    $value['token'] = $_SESSION['token'];
    $data = $devbase->curl('GET', 'floor',
        [
            'access_token'=>$value['token'],
            'option' => [
                'project_id' => 1,
                'build' => $dom,
                'floor' => $floor,
            ]
        ]);
    return $data;
//    echo json_encode($data);

}

function createSvg(){
    $data = getFloor($_POST['house'], $_POST['floor']);
    $url = 'https://reverside-wp.smarto.agency/flat/';
//    $img_svg = get_template_directory_uri().'/assets'.$data['data']['img'];
    $img_svg = 'https://reverside-wp.smarto.agency/wp-content/themes/reverside/assets/img/projects/1/color-floors/6.png';


    $size = getimagesize($img_svg);
    if ($size[0]<=1200){

        $cssSize = $size[0];
    } else {

        $cssSize = 1250;
        $keff = $size[0]/$cssSize; // коэф. для просчета высоты, делим реальную ширину на 1250
    }

    $cssSizeHeight = ($cssSize != 1250)? $size[1] : $size[1]/$keff;
    $svg_block = '<image x="0" y="0" height="100%" width="100%" style="overflow:visible; transform: scaleY(0.987) translateY(-4%);" xlink:href="'.$img_svg.'"/>'
        .'<style>.plan-appartment{opacity:0.55;} .plan-appartment:hover{opacity:0.8;}</style>
                    <g style="transform: scale(0.39, 0.385) translateX(-3%);">';
    if(!empty($data['data']['dataList'])):
    foreach ($data['data']['dataList'] as $item){
        $cords = $item['sorts'];
        $svg_block.= '<polygon '.$style.'  class="flat-link-path '.'
						 '.$class.'" points="'.$cords.'"
						  data-name="'.$item['type'].'"
						   data-link="'.$item['type'].'"
						    data-rooms="'.$item['rooms'].'"
						     data-total="'.$item['all_room'].'"
						      data-living="'.$item['life_room'].'"
						      data-id="'.$item['id'].'" ></polygon>';
    }
    endif;

    $svg_block.= '</g></svg>';
    $svg_block = '<svg  viewBox="0 0  '.$cssSize.' '.$cssSizeHeight*1.1.'" id="floor"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'.$svg_block ;

    echo json_encode($svg_block);
}


//print_r(getFloor($_POST['house'], $_POST['floor']));
//if($_POST['action'] == 'getFloor'){
//    print_r($_POST);
//    createSvg();
//}
//print_r($_POST);
//print_r($_GET);
switch ($_POST['action']) {
    case 'getFloor':
        createSvg();
        break;
    case 'getFlatById':
        getFlatById($_POST['id']);
        break;
    case 'getFlats':
        getFlats();
    break;
}
