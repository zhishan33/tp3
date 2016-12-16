<?php

namespace Home\Controller\Index;

use Think\Controller;

/**
 *
 */
class index extends Controller
{
    public function run($name = 'zhishan')
    {
        # code...
        echo '执行Index控制器的index操作'.$name.'<br/>';
    }
    public function _before_run()
    {
        echo 'before_'.ACTION_NAME.'<br/>';
    }
    public function _after_run()
    {
        echo 'after_'.ACTION_NAME.'<br/>';
    }
}
