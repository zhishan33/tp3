CREATE TABLE IF NOT EXISTS `think_data`(
`id`int(8)unsigned NOT NULL AUTO_INCREMENT,
`data` varchar(255) NOT NULL,
PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ;
INSERT INTO `think_data`(`id`,`data`) VALUES
(1,'thinkphp'),
(2,'php'),
(3,'framework');



CREATE TABLE IF NOT EXISTS `think_form` (
`id` smallint(4) unsigned NOT NULL AUTO_INCREMENT,
`title` varchar(255) NOT NULL,
`content` varchar(255) NOT NULL,
`create_time` int(11) unsigned NOT NULL,
PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ;

CREATE TABLE IF NOT EXISTS `think_user` (
`id` smallint(4) unsigned NOT NULL AUTO_INCREMENT,
`type` smallint(4) NOT NULL,
`status` smallint(4) NOT NULL,
`score` smallint(4) NOT NULL,
`title` varchar(255) NOT NULL,
`account` varchar(255) NOT NULL,
`name` varchar(255) NOT NULL,
`email` varchar(255) NOT NULL,
`address` varchar(255) NOT NULL,
`create_time` int(11) unsigned NOT NULL,
PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ;

INSERT INTO `think_user`(`id`,`type`,`status`,`title`,`account`,`name`,`email`,`address`,`create_time`) VALUES
(1,1,1,'thinkphp','thinkphp','thinkphp','thinkphp@test.com','中国山河','147855568854'),
(2,0,1,'php','php','php','php@test.com','中国上海','14785556854'),
(3,2,0,'framework','framework','framework','framework@test.com','中国江苏','14785568854');