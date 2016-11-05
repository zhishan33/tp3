<?php

namespace Home\Controller\_empty;

use Think\Controller;

/**
 *
 */
class index extends Controller
{
    public function run()
    {
        echo '执行'.CONTROLLER_NAME.'控制器'.ACTION_NAME.'操作';
    }
}
